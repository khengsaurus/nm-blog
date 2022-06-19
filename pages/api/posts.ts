import { one_hour } from "consts";
import { ErrorMessage, HttpRequest, ServerInfo } from "enums";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.GET:
      res.setHeader("Cache-Control", `maxage=${one_hour}, must-revalidate`);
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
  const { username, createdAt, limit = 2 } = params;
  return new Promise(async (resolve, reject) => {
    const { Post } = await mongoConnection();
    const query: any = { createdAt: { $lt: createdAt || new Date() } };
    if (username) query.username = username;
    if ((params.isPrivate as unknown as string) === "false") {
      query.isPrivate = false;
    }
    await Post.find(query)
      .populate("user", "-createdAt -updatedAt -email -password -posts")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .then((posts) => {
        resolve({
          status: 200,
          message: isEmpty(posts)
            ? ServerInfo.POST_NA
            : ServerInfo.POST_RETRIEVED,
          data: { posts },
        });
      })
      .catch((err) => reject(new ServerError(500, err?.message)));
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
            const newPost = new Post({ ...post, user: userId });
            newPost
              .save()
              .then((res) => {
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
          resolve({
            status: 200,
            message: ServerInfo.POST_UPDATED,
            data: postData,
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
        const { id } = req.query as Partial<IPostReq>;
        await Post.findByIdAndDelete(id)
          .then(() => {
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
