import { isEmpty } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { APIAction, HttpRequest, ServerInfo } from "../../enums";
import { mongoConnection } from "../../lib/server/mongoConnection";
import ServerError from "../../lib/server/ServerError";
import { hashPassword } from "../../lib/server/validation";
import { IResponse, IUser, IUserReq } from "../../types";
import {
  createUserObject,
  handleAPIError,
  handleBadRequest,
  processUserData,
} from "../../util/serverUtil";
import {
  decodeToken,
  generateToken,
  validateAuth,
  verify,
} from "./middlewares/auth";
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
      handlePost(req, res);
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
  const reqQuery = req.query as Partial<IUserReq>;
  if (!reqQuery.username) {
    handleBadRequest(res);
  } else {
    await getDoc(reqQuery)
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const reqBody = req.body as Partial<IUserReq>;
  const { email = "", password = "", login = true, action = "" } = reqBody;
  if (action === APIAction.USER_TOKEN_LOGIN) {
    handleTokenLogin(req, res);
  } else if (!password || (!login && !email)) {
    handleBadRequest(res);
  } else {
    await (login ? handleLogin(reqBody) : createDoc(reqBody))
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
}

async function handleRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (p: Partial<IUserReq>) => Promise<IResponse>
) {
  validateAuth(req)
    .then(() => callback(req.body))
    .then((payload) => forwardResponse(res, payload))
    .catch((err) => handleAPIError(res, err));
}

/**
 * @param reqBody: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve {..., token: JWT, user: user object without username}
 */
async function createDoc(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { email, password } = reqBody;
    try {
      const { User } = await mongoConnection();
      User.findOne({ email }).then((userData: any) => {
        if (!isEmpty(userData)) {
          resolve({ status: 200, message: ServerInfo.EMAIL_USED });
        } else {
          // Create acc without setting username
          const user = createUserObject({
            email,
            password: hashPassword(password),
          });
          User.create(user).then((res) => {
            if (!!res.id) {
              const token = generateToken(email, email, res.id);
              resolve({
                status: 200,
                message: ServerInfo.USER_REGISTERED,
                data: { token, user: processUserData(user, res.id) },
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
      const { User } = await mongoConnection();
      await User.findOne(params).then((userData) => {
        if (isEmpty(userData)) {
          resolve({ status: 200, message: ServerInfo.USER_NA });
        } else {
          resolve({
            status: 200,
            message: ServerInfo.USER_RETRIEVED,
            data: {
              user: processUserData(userData, userData._id),
            },
          });
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

/**
 * @param reqBody: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve {..., token: JWT}
 */
async function handleLogin(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { username, password } = reqBody;
    try {
      const { User } = await mongoConnection();
      User.findOne({ username }).then((userData) => {
        if (isEmpty(userData) || !verify({ username, password }, userData)) {
          resolve({
            status: 200,
            message: ServerInfo.USER_BAD_LOGIN,
            data: { token: null },
          });
        } else {
          const token = generateToken(userData.email, username, userData._id);
          resolve({
            status: 200,
            message: ServerInfo.USER_LOGIN,
            data: {
              token,
              user: processUserData(userData, userData._id),
            },
          });
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

async function handleTokenLogin(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
): Promise<IResponse> {
  return new Promise(async (_, reject) => {
    const token = decodeToken<Partial<IUser>>(req);
    const { id } = token;
    if (!id) {
      reject(new ServerError(401));
    } else {
      await getDoc({ _id: id })
        .then((payload) => forwardResponse(res, payload))
        .catch((err) => handleAPIError(res, err));
    }
  });
}

async function updateDoc(body: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { User } = await mongoConnection();
      const { email, username, action } = body;
      if (action === APIAction.USER_SET_USERNAME) {
        User.findOne({ username }).then((userData: any) => {
          if (!isEmpty(userData)) {
            resolve({
              status: 200,
              message: ServerInfo.USERNAME_TAKEN,
            });
            return;
          } else {
            User.findOne({ email }).then((userData) => {
              if (isEmpty(userData)) {
                resolve({
                  status: 400,
                  message: ServerInfo.USER_NA,
                });
              } else {
                User.updateOne({ email }, { $set: body }, (err, _res) => {
                  if (err) {
                    reject(new ServerError(500, err.message));
                  } else {
                    const token = generateToken(email, username, userData._id);
                    resolve({
                      status: 200,
                      message: ServerInfo.USER_UPDATED,
                      data: { ..._res, token },
                    });
                  }
                });
              }
            });
          }
        });
      }
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

async function deleteDoc(searchParams) {
  return new Promise(async (resolve, reject) => {
    try {
      const { User } = await mongoConnection();
      User.deleteOne(searchParams).then((res) => {
        if (res.acknowledged) {
          resolve({ status: 200, message: ServerInfo.USER_DELETED });
        } else {
          reject(new ServerError());
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}
