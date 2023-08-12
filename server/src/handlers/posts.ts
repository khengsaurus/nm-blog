import express, { type Request, type Response } from "express";
import { HOME, PAGINATE_LIMIT } from "../consts";
import { ErrorMessage, ServerInfo } from "../enums";
import {
  castAsBoolean,
  getQueryFromPostReq,
  processPost,
  processPosts,
  userDocToObj,
} from "../utils";
import { handleMongoConn, handleRedisConn, validateAuth } from "./util";

const postsHandler = express.Router();

postsHandler.get("/*", (req, res) => {
  const paths = (req.url || "").split(/\/|\?/);
  switch (paths[1]) {
    case "recent":
      return getRecent(req, res);
    case "home":
      return getHome(req, res);
    case "user":
      return getUserPosts(req, res);
    default:
      return getByQuery(req, res);
  }
});

async function getRecent(req: Request, res: Response) {
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  mongoConn
    .findPostsByQuery({ isPrivate: false })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()
    .exec()
    .then((posts) => {
      const paths =
        posts.map(({ username, slug }) => {
          return { params: { username, slug } };
        }) || [];
      res.status(200).json({ paths });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: ErrorMessage.P_RETRIEVE_FAIL });
    });
}

async function getHome(req: Request, res: Response) {
  const { redisErrorStatus, redisConn } = await handleRedisConn(req, res, true);

  let posts = redisErrorStatus ? [] : (await redisConn.get([], HOME)) || [];
  if (!posts.length) {
    const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
    if (mongoErrorStatus) return;

    const postQuery = await mongoConn
      .findPostsByQuery({ isPrivate: false })
      .select(["-user"])
      .sort({ createdAt: -1 })
      .limit(PAGINATE_LIMIT)
      .lean();
    posts = postQuery.map((post) => processPost(post));
    if (!redisErrorStatus) redisConn.setKeyValue(HOME, posts);
  }

  res.status(200).json({ message: ServerInfo.POST_RETRIEVED, posts });
}

async function getUserPosts(req: Request, res: Response) {
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  const { username, limit = PAGINATE_LIMIT } = req.query as Partial<IPostReq>;
  const userQuery = await mongoConn
    .findUser({ username })
    .select(["-password -posts"])
    .populate({
      path: "posts",
      match: { isPrivate: false },
      options: {
        limit,
        sort: { createdAt: -1 },
        select: ["-user"],
      },
    })
    .lean();
  const user = userDocToObj(userQuery);

  res.status(200).json({ message: ServerInfo.POST_RETRIEVED, user });
}

async function getByQuery(req: Request, res: Response) {
  const {
    username,
    isPrivate: _isPrivate,
    createdAt = "",
    search = "",
    limit = PAGINATE_LIMIT,
  } = req.query as Partial<IPostReq>;
  const isPrivate = castAsBoolean(_isPrivate);

  if (isPrivate && (!username || username !== validateAuth(req)?.username)) {
    return res.sendStatus(401);
  }

  const { redisErrorStatus, redisConn } = await handleRedisConn(req, res, true);

  if (!search?.trim()) {
    // if there is a search key, don't return cached
    const posts = await redisConn.read(
      username,
      isPrivate,
      createdAt,
      search,
      limit
    );
    if (posts?.length) {
      return res.status(200).json({
        message: ServerInfo.POST_RETRIEVED_CACHED,
        posts,
        error: false,
      });
    }
  }

  // retrieve posts from db, save to redis, return posts
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  const query = getQueryFromPostReq({ username, isPrivate, createdAt, search });
  mongoConn
    .findPostsByQuery(query)
    .select(["-files"])
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .then((_posts) => {
      let posts: IPost[] = [];
      if (_posts?.length) {
        posts = processPosts(_posts);
        if (!redisErrorStatus) {
          redisConn.write(posts, username, isPrivate, createdAt, search, limit);
        }
      }
      res.status(200).json({
        message: posts?.length ? ServerInfo.POST_RETRIEVED : ServerInfo.POST_NA,
        posts,
        error: false,
      });
    })
    .catch((err) => {
      res.status(200).json({
        message: ErrorMessage.P_RETRIEVE_FAIL,
        posts: [],
        trace: err?.message,
        error: true,
      });
    });
}

export default postsHandler;
