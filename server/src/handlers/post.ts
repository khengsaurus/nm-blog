import express from "express";
import isEmpty from "lodash.isempty";
import { DEFAULT_EXPIRE_S } from "../consts";
import { ErrorMessage, ServerInfo } from "../enums";
import { castAsBoolean, processPost } from "../utils";
import {
  handleAuth,
  handleMongoConn,
  handleRedisConn,
  validateAuth,
} from "./util";

const postHandler = express.Router();

postHandler.get("/*", async (req, res) => {
  const { fresh, id, slug, username } = req.query as Partial<IPostReq>;
  const _fresh = castAsBoolean(fresh);

  const { redisErrorStatus, redisConn } = await handleRedisConn(req, res, true);

  // if !fresh, return post from redis if available
  if (!redisErrorStatus && username && slug && !_fresh) {
    const redisKey = `NM_${username}-${slug}`;
    const post = await redisConn.get(null, redisKey);
    if (post) {
      return !post?.isPrivate || Boolean(validateAuth(req, post.user?.id))
        ? res.status(200).json({
            message: ServerInfo.POST_RETRIEVED_CACHED,
            post,
          })
        : res.sendStatus(401);
    }
  }

  // retrieve post from db, save to redis, return post
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  (id ? mongoConn.findPostById(id) : mongoConn.findPost({ username, slug }))
    .lean()
    .populate("user", "-createdAt -updatedAt -email -password -posts")
    .then((_post) => {
      if (isEmpty(_post)) {
        res.status(200).json({ message: ServerInfo.POST_NA, error: true });
      } else {
        const post = processPost(_post);
        if (post?.isPrivate && !validateAuth(req, post.user?.id))
          return res.sendStatus(401);

        const redisKey = `NM_${post.username}-${post.slug}`;
        if (!redisErrorStatus)
          redisConn.setKeyValue(redisKey, post, DEFAULT_EXPIRE_S);
        return res.status(200).json({
          message: ServerInfo.POST_RETRIEVED,
          post,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: ErrorMessage.P_RETRIEVE_FAIL,
        trace: err?.message,
        error: true,
        post: null,
      });
    });
});

postHandler.post("/*", async (req, res) => {
  const { id: userId } = handleAuth(req, res) || {};
  if (!userId) return;

  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  let txnSuccess = true;
  let newPostDoc;

  mongoConn
    .startSession()
    .then((session) =>
      session.withTransaction(async () => {
        const { isPrivate, slug, ...postPayload } =
          req.body as Partial<IPostReq>;

        // if post by that userId & slug exists, return error
        const exists = await mongoConn.checkPostExists(userId, slug);
        if (exists) {
          return res.status(200).json({
            message: ErrorMessage.P_SLUG_USED,
            error: true,
          });
        }

        newPostDoc = {
          ...postPayload,
          slug,
          isPrivate: castAsBoolean(isPrivate),
          user: userId,
        };
        mongoConn.createPost(newPostDoc).then((post) => {
          if (post.id) {
            mongoConn.updateUser(
              userId,
              { $push: { posts: { $each: [post.id], $position: 0 } } },
              { safe: true, upsert: true },
              (err) => {
                if (err) throw err;
                res.status(200).json({
                  message: ServerInfo.POST_CREATED,
                  post,
                });
              }
            );
          } else {
            throw new Error(ErrorMessage.P_CREATE_FAIL);
          }
        });
      })
    )
    .catch((err) => {
      txnSuccess = false;
      res.status(200).json({ message: err?.message, error: true });
    })
    .finally(() => {
      if (txnSuccess && newPostDoc) {
        handleRedisConn(req, res, true)
          .then(({ redisConn }) => redisConn?.newPostCreated(newPostDoc))
          .catch(console.error);
      }
    });
});

postHandler.patch("/*", async (req, res) => {
  if (!handleAuth(req, res)) return;

  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  const { id, ..._set } = req.body as Partial<IPostReq>;
  _set.isPrivate = castAsBoolean(req.body?.isPrivate);
  let wasPrivate = false;

  mongoConn.updatePost(id, _set, async (err, oldPost) => {
    if (err) {
      return res.status(200).json({ message: err?.message, error: true });
    }

    wasPrivate = castAsBoolean(oldPost.isPrivate);
    const { redisErrorStatus, redisConn } = await handleRedisConn(
      req,
      res,
      true
    );

    res.status(200).json({ message: ServerInfo.POST_UPDATED, post: req.body });
    if (!redisErrorStatus) {
      redisConn
        .resetCache(
          req.body,
          // Reset home keys if isPrivate changed
          _set.isPrivate === wasPrivate ? 0 : _set.isPrivate ? 1 : 2
        )
        .catch(console.error);
    }
  });
});

postHandler.delete("/*", async (req, res) => {
  const { id: userId, username } = handleAuth(req, res) || {};
  if (!userId) return;

  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  const { id, isPrivate } = req.query as Partial<IPostReq>;
  let txnSuccess = true;
  let slug = "";

  const post = await mongoConn
    .findPostById(id)
    .select("user")
    .populate(
      "user",
      "-email -password -username -isAdmin -posts -createdAt -updatedAt"
    );
  if (!post?.user?.id || userId !== post.user.id.toString())
    return res.status(401);

  mongoConn
    .startSession()
    .then((session) =>
      session.withTransaction(async () => {
        await mongoConn.deletePost(id).then((deleteRes) => {
          slug = deleteRes?.slug || "";
          mongoConn.updateUser(
            userId,
            { $pullAll: { posts: [id] } },
            { lean: true, new: true },
            (err) => {
              if (err) throw err;
              return res.status(200).json({ message: ServerInfo.POST_DELETED });
            }
          );
        });
      })
    )
    .catch((err) => {
      txnSuccess = false;
      res.status(500).json({
        message: err?.message || ErrorMessage.P_DELETE_FAIL,
        error: true,
      });
    })
    .finally(() => {
      if (txnSuccess && slug) {
        handleRedisConn(req, res, true)
          .then(({ redisConn }) =>
            redisConn?.resetCache({
              id,
              username,
              slug,
              isPrivate: castAsBoolean(isPrivate),
            })
          )
          .catch(console.error);
      }
    });
});

export default postHandler;
