import {
  CACHE_DEFAULT,
  DEFAULT_EXPIRE_S,
  EXPERIMENTAL_RUNTIME,
  PAGINATE_LIMIT,
} from "consts";
import { ErrorMessage, HttpRequest, ServerInfo } from "enums";
import {
  forwardResponse,
  handleAPIError,
  handleBadRequest,
  handleRequest,
} from "lib/middlewares";
import { throwAPIError } from "lib/middlewares/util";
import { MongoConnection, RedisClient, ServerError } from "lib/server";
import { isEmpty } from "lodash";
import { ClientSession } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { IPost, IPostReq, IResponse } from "types";
import {
  castAsBoolean,
  processPostsWithoutUser,
  processPostWithoutUser,
  processPostWithUser,
} from "utils";

export const config = EXPERIMENTAL_RUNTIME;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.GET:
      return handleGet(req, res);
    case HttpRequest.POST:
      return handleRequest(req, res, createDoc);
    case HttpRequest.PATCH:
      return handleRequest(req, res, patchDoc);
    case HttpRequest.DELETE:
      return handleRequest(req, res, deleteDoc);
    default:
      return handleBadRequest(res);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const reqQuery = req.query as Partial<IPostReq>;
  const singlePost = (reqQuery?.limit || 1) <= 1;
  await (singlePost ? getPost(reqQuery) : getPosts(reqQuery))
    .then((payload) => {
      if (payload.status === 200) {
        res.setHeader("Cache-Control", singlePost ? "no-cache" : CACHE_DEFAULT);
      }
      forwardResponse(res, payload);
    })
    .catch((err) => handleAPIError(res, err));
}

async function getPosts(params: Partial<IPostReq>): Promise<IResponse> {
  const {
    username,
    isPrivate: _isPrivate,
    createdAt = "",
    search = "",
    limit = PAGINATE_LIMIT,
  } = params;
  const isPrivate = castAsBoolean(_isPrivate);

  return new Promise(async (resolve, reject) => {
    let posts = await RedisClient.read(
      username,
      isPrivate,
      createdAt,
      search,
      limit
    );
    if (posts?.length) {
      resolve({
        status: 200,
        message: ServerInfo.POST_RETRIEVED_CACHED,
        data: { posts },
      });
    } else {
      const query: any = createdAt ? { createdAt: { $lt: createdAt } } : {};
      if (username) query.username = username;
      if (!isPrivate) query.isPrivate = false;
      if (search)
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { body: { $regex: search, $options: "i" } },
        ];
      const { Post } = await MongoConnection();
      Post.find(query)
        .select(["-files"])
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .then((_posts) => {
          if (_posts?.length) {
            posts = processPostsWithoutUser(_posts);
            RedisClient.write(
              posts,
              username,
              isPrivate,
              createdAt,
              search,
              limit
            );
          }
          resolve({
            status: 200,
            message: posts?.length
              ? ServerInfo.POST_RETRIEVED
              : ServerInfo.POST_NA,
            data: { posts },
          });
        })
        .catch((err) => reject(new ServerError(500, err?.message)));
    }
  });
}

async function getPost(params: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { fresh, id, slug, username } = params;
    if (!id && !username && !slug) reject(new ServerError(400));
    else {
      const _fresh = castAsBoolean(fresh);
      if (username && slug && !_fresh) {
        // Retrieve from cache if !_fresh
        const redisKey = `NM_${username}-${slug}`;
        const post = await RedisClient.get(null, redisKey);
        if (post) {
          return resolve({
            status: 200,
            message: ServerInfo.POST_RETRIEVED_CACHED,
            data: { post },
          });
        }
      }
      const { Post } = await MongoConnection();
      (id ? Post.findById(id) : Post.findOne({ username, slug }))
        .lean()
        .then((_post) => {
          if (isEmpty(_post)) {
            reject(new ServerError(400, ServerInfo.POST_NA));
          } else {
            const post = processPostWithoutUser(_post);
            const redisKey = `NM_${post.username}-${post.slug}`;
            RedisClient.setKeyValue(redisKey, post, DEFAULT_EXPIRE_S);
            resolve({
              status: 200,
              message: ServerInfo.POST_RETRIEVED,
              data: { post },
            });
          }
        })
        .catch((err) =>
          throwAPIError(reject, err, ErrorMessage.P_RETRIEVE_FAIL)
        );
    }
  });
}

async function createDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { Post, User, mongoConnection } = await MongoConnection();
    let session = await mongoConnection.startSession();
    session.withTransaction(async () => {
      const userId = req.headers["user-id"];
      const post: Partial<IPostReq> = req.body;
      const { isPrivate: _isPrivate, slug } = post;
      const isPrivate = castAsBoolean(_isPrivate);
      let newPost;
      Post.exists({ slug, user: userId })
        .then((exists) => {
          if (exists) {
            reject(new ServerError(200, ErrorMessage.P_SLUG_USED));
          } else {
            newPost = new Post({
              ...post,
              user: userId,
              isPrivate,
            });
            return newPost.save() as Promise<IPost>;
          }
        })
        .then((res) => {
          if (res.id) {
            RedisClient.newPostCreated(newPost);
            User.findByIdAndUpdate(
              userId,
              { $push: { posts: { $each: [res.id], $position: 0 } } },
              { safe: true, upsert: true },
              (err) => {
                if (err) {
                  reject(new ServerError(500, err?.message));
                } else {
                  resolve({
                    status: 200,
                    message: ServerInfo.POST_CREATED,
                    data: { post: res },
                  });
                }
              }
            );
          } else {
            reject(new ServerError(500, ErrorMessage.P_CREATE_FAIL));
          }
        })
        .catch((err) => throwAPIError(reject, err, ErrorMessage.P_CREATE_FAIL));
    });
  });
}

async function patchDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { id, ..._set } = req.body as Partial<IPostReq>;
    _set.isPrivate = castAsBoolean(req.body?.isPrivate);
    const { Post } = await MongoConnection();
    const post = await Post.findById(id);
    const wasPrivate = castAsBoolean(post.isPrivate);

    Post.findByIdAndUpdate(id, _set, (err, res) => {
      if (err) {
        throwAPIError(reject, err, ErrorMessage.P_UPDATE_FAIL);
      } else {
        const post = processPostWithUser(res);
        RedisClient.resetCache(
          post,
          // Reset home keys if isPrivate changed
          _set.isPrivate === wasPrivate
            ? 0
            : !wasPrivate && _set.isPrivate
            ? 1
            : 2
        );
        resolve({
          status: 200,
          message: ServerInfo.POST_UPDATED,
          data: { post },
        });
      }
    });
  });
}

async function deleteDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    let session: ClientSession = null;
    const { Post, User, mongoConnection } = await MongoConnection();
    session = await mongoConnection.startSession();
    await session.withTransaction(async () => {
      const userId = req.headers["user-id"];
      const {
        id,
        username,
        isPrivate: _isPrivate, // string
      } = req.query as Partial<IPostReq>;
      const isPrivate = castAsBoolean(_isPrivate);
      await Post.findByIdAndDelete(id)
        .then(() => {
          RedisClient.resetCache({
            id,
            username,
            isPrivate,
          });
          User.findByIdAndUpdate(
            userId,
            { $pullAll: { posts: [id] } },
            { lean: true, new: true },
            function (err, _) {
              if (err) {
                reject(
                  new ServerError(
                    500,
                    `${ErrorMessage.P_DELETE_FAIL}: ${err?.message}`
                  )
                );
              } else {
                resolve({ status: 200, message: ServerInfo.POST_DELETED });
              }
            }
          );
        })
        .catch((err) => throwAPIError(reject, err, ErrorMessage.P_DELETE_FAIL));
    });
  });
}
