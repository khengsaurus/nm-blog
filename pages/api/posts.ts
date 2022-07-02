import { CACHE_DEFAULT, PAGINATE_LIMIT } from "consts";
import { ErrorMessage, HttpRequest, ServerInfo } from "enums";
import {
  forwardResponse,
  handleAPIError,
  handleBadRequest,
  handleRequest,
} from "lib/middlewares";
import { throwAPIError } from "lib/middlewares/util";
import { MongoConnection, RedisConnection, ServerError } from "lib/server";
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
    limit = PAGINATE_LIMIT,
  } = params;
  const isPrivate = castAsBoolean(_isPrivate);

  return new Promise(async (resolve, reject) => {
    const client = new RedisConnection();
    let posts = await client.read(username, isPrivate, createdAt, limit);
    if (posts?.length) {
      client.close();
      resolve({
        status: 200,
        message: ServerInfo.POST_RETRIEVED_CACHED,
        data: { posts },
      });
    } else {
      const query: any = createdAt ? { createdAt: { $lt: createdAt } } : {};
      if (username) query.username = username;
      if (!isPrivate) query.isPrivate = false;
      const { Post } = await MongoConnection();
      await Post.find(query)
        .select(["-user"])
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .then((_posts) => {
          if (_posts?.length) {
            posts = processPostsWithoutUser(_posts);
            client.write(posts, username, isPrivate, createdAt, limit);
          }
          resolve({
            status: 200,
            message: posts?.length
              ? ServerInfo.POST_RETRIEVED
              : ServerInfo.POST_NA,
            data: { posts },
          });
        })
        .catch((err) => reject(new ServerError(500, err?.message)))
        .finally(client.close);
    }
  });
}

async function getPost(params: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { id, username, slug } = params;
    if (!id && !username && !slug) reject(new ServerError(400));
    else {
      const { Post } = await MongoConnection();
      await (id ? Post.findById(id) : Post.findOne({ username, slug }))
        .select(["-user"])
        .lean()
        .then((_post) => {
          if (isEmpty(_post)) {
            reject(new ServerError(400, ServerInfo.POST_NA));
          } else {
            const post = processPostWithoutUser(_post);
            resolve({
              status: 200,
              message: ServerInfo.POST_RETRIEVED,
              data: { post },
            });
          }
        })
        .catch((err) => {
          throwAPIError(reject, err, ErrorMessage.P_RETRIEVE_FAIL);
        });
    }
  });
}

async function createDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    let session: ClientSession = null;

    const { Post, User, mongoConnection } = await MongoConnection();
    session = await mongoConnection.startSession();
    await session.withTransaction(async () => {
      const userId = req.headers["user-id"];
      const post: Partial<IPostReq> = req.body;
      const { isPrivate: _isPrivate, slug } = post;
      const isPrivate = castAsBoolean(_isPrivate);
      let newPost;
      await Post.exists({ slug, user: userId })
        .then((exists) => {
          if (exists) {
            reject(new ServerError(200, ErrorMessage.P_SLUG_USED));
          } else {
            newPost = new Post({
              ...post,
              isPrivate,
              user: userId,
            });
            return newPost.save() as Promise<IPost>;
          }
        })
        .then((res) => {
          if (res.id) {
            const client = new RedisConnection();
            client.newPostCreated(newPost, false);
            User.findByIdAndUpdate(
              userId,
              { $push: { posts: { $each: [res.id], $position: 0 } } },
              { safe: true, upsert: true },
              function (err) {
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
    for (const key of Object.keys(_set)) post[key] = _set[key];
    await post
      .save()
      .then((_post) => {
        const post = processPostWithUser(_post);
        const client = new RedisConnection();
        client.resetCache(post, false);
        resolve({
          status: 200,
          message: ServerInfo.POST_UPDATED,
          data: { post },
        });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.P_UPDATE_FAIL));
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
          const client = new RedisConnection();
          client.resetCache({ id, username, isPrivate }, false);
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
