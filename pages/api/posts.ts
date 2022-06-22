import { PAGINATE_LIMIT } from "consts";
import { Duration, ErrorMessage, HttpRequest, ServerInfo } from "enums";
import {
  forwardResponse,
  handleAPIError,
  handleBadRequest,
  handleRequest,
} from "lib/middlewares";
import { mongoConnection, ServerError } from "lib/server";
import { isEmpty } from "lodash";
import { ClientSession } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { IPostReq, IResponse } from "types";
import { postDocToObj } from "utils";
import Memo from "utils/Memo";

/**
 * Caching system:
 * *1: `get most recent N`
 * *2: `get next most recent N`
 *
 * After post A is created:
 *   *1 -> include A in the response & cache res *1
 * After post B is edited/deleted, with B being the (N+1)th most recent,
 *   *1 -> send cached res *1
 *   *2 -> include updated B in the response & cache res *2
 *
 */

const memo = new Memo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.GET:
      res.setHeader("Cache-Control", `maxage=${Duration.MIN}, must-revalidate`);
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
  await (reqQuery?.limit > 1 ? getPosts(reqQuery) : getPost(reqQuery))
    .then((payload) => forwardResponse(res, payload))
    .catch((err) => handleAPIError(res, err));
}

async function getPosts(params: Partial<IPostReq>): Promise<IResponse> {
  const {
    username,
    isPrivate,
    createdAt = memo.current,
    limit = PAGINATE_LIMIT,
  } = params;
  return new Promise(async (resolve, reject) => {
    const { Post } = await mongoConnection();
    const cached = memo.read(username, isPrivate, createdAt, limit);
    if (cached) {
      resolve({
        status: 200,
        message: ServerInfo.POST_RETRIEVED_CACHED,
        data: { posts: cached, updated: createdAt },
      });
    } else {
      const query: any = { createdAt: { $lt: createdAt } };
      if (username) query.username = username;
      if (!isPrivate || (isPrivate as unknown as string) === "false")
        query.isPrivate = false;
      await Post.find(query)
        .populate("user", "-createdAt -updatedAt -email -password -posts")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .then((posts) => {
          const noPosts = isEmpty(posts);
          if (!noPosts)
            memo.write(posts, username, isPrivate, limit, createdAt);
          resolve({
            status: 200,
            message: noPosts ? ServerInfo.POST_NA : ServerInfo.POST_RETRIEVED,
            data: { posts, updated: createdAt },
          });
        })
        .catch((err) => reject(new ServerError(500, err?.message)));
    }
  });
}

async function getPost(params: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { id, username, slug } = params;
    if (!id && !username && !slug) reject(new ServerError(400));
    else {
      try {
        const { Post } = await mongoConnection();
        await (id ? Post.findById(id) : Post.findOne({ username, slug }))
          .select(["-user"])
          .lean()
          .then((post) => {
            if (isEmpty(post)) {
              reject(new ServerError(400, ServerInfo.POST_NA));
            } else {
              resolve({
                status: 200,
                message: ServerInfo.POST_RETRIEVED,
                data: { post },
              });
            }
          });
      } catch (err) {
        reject(new ServerError(500, err?.message));
      }
    }
  });
}

async function createDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    let session: ClientSession = null;
    try {
      const { MongoConnection } = await mongoConnection();
      session = await MongoConnection.startSession();
      await session.withTransaction(async () => {
        const { Post, User } = await mongoConnection();
        const userId = req.headers["user-id"];
        const post: Partial<IPostReq> = req.body;
        await Post.exists({ slug: post.slug, user: userId }).then((exists) => {
          if (exists) {
            throw new ServerError(200, ErrorMessage.POST_SLUG_USED);
          } else {
            const newPost = new Post({
              ...post,
              user: userId,
            });
            newPost
              .save()
              .then((res) => {
                memo.updateCurrent();
                memo.resetHomeQuery();
                if (res.id) {
                  User.findByIdAndUpdate(
                    userId,
                    { $push: { posts: { $each: [res.id], $position: 0 } } },
                    { safe: true, upsert: true },
                    function (err) {
                      if (err) {
                        throw new ServerError(500, err?.message);
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
                  throw new ServerError(500, ErrorMessage.POST_CREATE_FAIL);
                }
              })
              .catch((err) => reject(new ServerError(500, err?.message)));
          }
        });
      });
    } catch (err) {
      reject(new ServerError(500, err?.message));
    } finally {
      session?.endSession();
    }
  });
}

async function patchDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, ..._set } = req.body as Partial<IPostReq>;
      const { Post } = await mongoConnection();
      const post = await Post.findById(id);
      for (const key of Object.keys(_set)) {
        post[key] = _set[key];
      }
      await post
        .save()
        .then((postData) => {
          const post = postDocToObj(postData);
          // isPrivate boolean here
          memo.resetCache(post);
          resolve({
            status: 200,
            message: ServerInfo.POST_UPDATED,
            data: { post },
          });
        })
        .catch((err) => reject(new ServerError(500, err?.message)));
    } catch (err) {
      reject(new ServerError(500, err?.message));
    }
  });
}

async function deleteDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    let session: ClientSession = null;
    try {
      const { MongoConnection } = await mongoConnection();
      session = await MongoConnection.startSession();
      await session.withTransaction(async () => {
        const { Post, User } = await mongoConnection();
        const userId = req.headers["user-id"];
        const {
          id,
          username,
          isPrivate: _isPrivate, // string
        } = req.query as Partial<IPostReq>;
        const isPrivate = !((_isPrivate as unknown) === "false" || !_isPrivate);
        await Post.findByIdAndDelete(id)
          .then(() => {
            memo.resetCache({ id, username, isPrivate });
            User.findByIdAndUpdate(
              userId,
              { $pullAll: { posts: [id] } },
              { lean: true, new: true },
              function (err, doc) {
                if (err) {
                  throw new ServerError(500, err?.message);
                } else {
                  resolve({ status: 200, message: ServerInfo.POST_DELETED });
                }
              }
            );
          })
          .catch((err) => {
            throw new ServerError(500, err.message);
          });
      });
    } catch (err) {
      reject(new ServerError(500, err?.message));
    } finally {
      session?.endSession();
    }
  });
}
