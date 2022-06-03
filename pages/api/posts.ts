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
      return handleGet(req, res);
    case HttpRequest.POST:
      return handleRequest(req, res, createDoc);
    case HttpRequest.PUT:
      return handleRequest(req, res, updateDoc);
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
    if (!id && (!username || !slug)) reject(new ServerError(400));
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
        const reqBody: Partial<IPostReq> = req.body;
        const { slug, userId } = reqBody;
        await Post.exists({ slug, user: userId }).then((exists) => {
          if (exists) {
            throw new ServerError(200, ErrorMessage.POST_SLUG_USED);
          } else {
            const { userId, ...post } = reqBody;
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
                  throw new ServerError();
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

async function updateDoc(req: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { Post } = await mongoConnection();
      const { userId, id, slug } = req;
      // TODO: slug !== post[id].slug -> changing slug, check if slug is avail
      await Post.updateOne(
        { user: userId, _id: id },
        { $set: req },
        (err, _res) => {
          if (err) {
            reject(new ServerError(500, err?.message));
          } else {
            resolve({
              status: 200,
              message: ServerInfo.POST_UPDATED,
              data: { ..._res },
            });
          }
        }
      );
    } catch (err) {
      reject(new ServerError(500, err?.message));
    }
  });
}

async function deleteDoc(req: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { userId, id } = req;
    try {
      const { Post } = await mongoConnection();
      await Post.deleteOne({ user: userId, _id: id }).then((res) => {
        if (res.acknowledged) {
          resolve({ status: 200, message: ServerInfo.POST_DELETED });
        } else {
          reject(new ServerError());
        }
      });
    } catch (err) {
      reject(new ServerError(500, err?.message));
    }
  });
}
