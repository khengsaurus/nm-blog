import { isEmpty } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { HttpRequest, ServerInfo } from "../../enums";
import { mongoConnection } from "../../lib/server/mongoConnection";
import ServerError from "../../lib/server/ServerError";
import { IPostReq, IResponse } from "../../types";
import { handleAPIError, handleBadRequest } from "../../util/serverUtil";
import { validateAuth } from "./middlewares/auth";
import { forwardResponse } from "./middlewares/forwardResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.GET:
      handleGet(req, res);
      break;
    case HttpRequest.POST:
      handleRequest(req, res, createDoc);
      break;
    case HttpRequest.PUT:
      handleRequest(req, res, updateDoc);
      break;
    case HttpRequest.DELETE:
      handleRequest(req, res, deleteDoc);
      break;
    default:
      handleBadRequest(res);
      break;
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const reqQuery = req.query as Partial<IPostReq>;
  const { user, slug, count = 1 } = reqQuery;
  if (count > 1) {
    // fetch a few
  } else {
    if (!user || !slug) {
      handleBadRequest(res);
    } else {
      await getDoc(reqQuery)
        .then((payload) => forwardResponse(res, payload))
        .catch((err) => handleAPIError(res, err));
    }
  }
}

async function handleRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (p: Partial<IPostReq>) => Promise<IResponse>
) {
  validateAuth(req)
    .then(() => callback(req.body))
    .then((payload) => forwardResponse(res, payload))
    .catch((err) => handleAPIError(res, err));
}

async function createDoc(reqBody: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { slug, userId } = reqBody;
    try {
      const { Post } = await mongoConnection();
      Post.findOne({ slug, userId }).then((existingPost) => {
        if (!isEmpty(existingPost)) {
          resolve({ status: 200, message: ServerInfo.POST_SLUG_TAKEN });
        } else {
          Post.create(reqBody).then((res) => {
            if (!!res.id) {
              resolve({
                status: 200,
                message: ServerInfo.POST_CREATED,
                data: { postId: res.id, post: res },
              });
            } else {
              reject(new ServerError());
            }
          });
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

async function getDoc(params: object): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { Post } = await mongoConnection();
      await Post.findOne(params).then((post) => {
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
      reject(new ServerError(500, err.message));
    }
  });
}

async function updateDoc(req: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { Post } = await mongoConnection();
      const { user, id, update } = req;
      if (update) {
        Post.updateOne({ user, id }, { $set: req }, (err, _res) => {
          if (err) {
            reject(new ServerError(500, err.message));
          } else {
            resolve({
              status: 200,
              message: ServerInfo.POST_UPDATED,
              data: { ..._res },
            });
          }
        });
      } else {
        Post.findOne({ user, id }).then((existPost: any) => {
          if (!isEmpty(existPost)) {
            resolve({
              status: 200,
              message: ServerInfo.POST_SLUG_TAKEN,
            });
            return;
          } else {
          }
        });
      }
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

async function deleteDoc(req: Partial<IPostReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { user, id } = req;
    try {
      const { Post } = await mongoConnection();
      Post.deleteOne({ user, id }).then((res) => {
        if (res.acknowledged) {
          resolve({ status: 200, message: ServerInfo.POST_DELETED });
        } else {
          reject(new ServerError());
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}
