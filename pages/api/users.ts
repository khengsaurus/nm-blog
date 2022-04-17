import { extend, isEmpty } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  APIAction,
  ServerInfo,
  HttpRequest,
  HttpResponse,
  ServerError,
} from "../../enum";
import { mongoConnection } from "../../lib/server/mongoConnection";
import { hashPassword } from "../../lib/server/validation";
import { IResponse, IUser, IUserReq } from "../../types";
import {
  createUserObject,
  handleBadRequest,
  handleInternalError,
  processUserData,
} from "../../util/serverUtil";
import {
  decodeToken,
  generateToken,
  validateAuth,
  verify,
} from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
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
      handlePut(req, res);
      break;
    case HttpRequest.DELETE:
      handleDelete(req, res);
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
      .catch((err) => handleInternalError(res, err));
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
      .catch((err) => handleInternalError(res, err));
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const reqBody = req.body as Partial<IUserReq>;
  validateAuth(req)
    .then(() => updateDoc(reqBody))
    .then((payload) => forwardResponse(res, payload))
    .catch((err) => handleBadRequest(res, err));
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const reqBody = req.body as Partial<IUserReq>;
  validateAuth(req)
    .then(() => deleteDoc(reqBody))
    .then((payload) => forwardResponse(res, payload))
    .catch((err) => handleBadRequest(res, err));
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
      User.findOne({ email }).then((existingUser: any) => {
        if (!isEmpty(existingUser)) {
          resolve({ status: 200, message: ServerInfo.EMAIL_USED });
        } else {
          // Create acc without setting username
          const user = createUserObject({
            email,
            password: hashPassword(password),
          });
          User.create(user).then((res) => {
            if (!!res.id) {
              const token = generateToken(email, email);
              resolve({
                status: 200,
                message: ServerInfo.USER_DOC_CREATED,
                data: { token, user: processUserData(user) },
              });
            } else {
              console.info(ServerError.CREATE_USER);
              reject(new Error(HttpResponse._500));
            }
          });
        }
      });
    } catch (err) {
      reject(err);
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
              user: processUserData(userData),
            },
          });
        }
      });
    } catch (err) {
      reject(err);
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
      User.findOne({ username }).then((existingUser) => {
        if (
          isEmpty(existingUser) ||
          !verify({ username, password }, existingUser)
        ) {
          resolve({
            status: 200,
            message: ServerInfo.USER_BAD_LOGIN,
            data: { token: null },
          });
        } else {
          const token = generateToken(existingUser.email, username);
          resolve({
            status: 200,
            message: ServerInfo.USER_LOGIN,
            data: { token, user: processUserData(existingUser) },
          });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function handleTokenLogin(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
): Promise<IResponse> {
  return new Promise(async (_, reject) => {
    const { email, username } = decodeToken<Partial<IUser>>(req);
    if (!email) {
      reject(new Error(HttpResponse._401));
    } else {
      await getDoc({ email, username })
        .then((payload) => forwardResponse(res, payload))
        .catch((err) => handleInternalError(res, err));
    }
  });
}

async function updateDoc(body: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { User } = await mongoConnection();
      const { email, username, action } = body;
      if (action === APIAction.USER_SET_USERNAME) {
        User.findOne({ username }).then((existingUser: any) => {
          if (!isEmpty(existingUser)) {
            resolve({
              status: 200,
              message: ServerInfo.USERNAME_TAKEN,
            });
            return;
          } else {
            User.findOne({ email }).then((existingUser: any) => {
              if (isEmpty(existingUser)) {
                resolve({
                  status: 400,
                  message: ServerInfo.USER_NA,
                });
              } else {
                User.updateOne({ email }, { $set: body }, (err, _res) => {
                  if (err) {
                    reject(err);
                  } else {
                    const token = generateToken(email, username);
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
      reject(err);
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
          reject(new Error(HttpResponse._500));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
