import { extend, isEmpty } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { APIAction, ApiInfo, HttpRequest, HTTP_RES } from "../../enum";
import { mongoConnection } from "../../lib/server/mongoConnection";
import { hashPassword } from "../../lib/server/validation";
import { IResponse, IUser, IUserReq } from "../../types";
import { handleBadRequest, processUserData } from "../../util/serverUtil";
import {
  decodeToken,
  generateToken,
  validateAuth,
  verify,
} from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { forwardResponse } from "./middlewares/forwardResponse";

function createObj(params: Object) {
  const baseUser = {
    avatar: "",
    bio: "",
    createdAt: "",
    email: "",
    password: "",
    username: "",
    cart: null,
  };
  return extend(baseUser, params);
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
          resolve({ status: 200, message: ApiInfo.EMAIL_USED });
        } else {
          // Create acc without setting username
          const user = createObj({ email, password: hashPassword(password) });
          User.create(user).then((res) => {
            if (!!res.id) {
              const token = generateToken(email, email);
              resolve({
                status: 200,
                message: ApiInfo.EMAIL_AVAIL,
                data: { token, user: processUserData(user) },
              });
            } else {
              console.info("Failed to create new user");
              reject(new Error(HTTP_RES._500));
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
      console.log("getDoc called");
      const { User } = await mongoConnection();
      await User.findOne(params).then((userData) => {
        if (isEmpty(userData)) {
          resolve({ status: 200, message: ApiInfo.USER_NA });
        } else {
          resolve({
            status: 200,
            message: ApiInfo.USER_RETRIEVED,
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
            message: ApiInfo.USER_LOGIN_WRONG_CREDENTIALS,
            data: { token: null },
          });
        } else {
          const token = generateToken(existingUser.email, username);
          resolve({
            status: 200,
            message: ApiInfo.USER_LOGIN,
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
      reject(new Error(HTTP_RES._401));
    } else {
      try {
        await getDoc({ email, username }).then((payload) =>
          forwardResponse(res, payload)
        );
      } catch (err) {
        console.log(err);
        reject(err);
      }
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
              message: ApiInfo.USERNAME_TAKEN,
              data: {},
            });
            return;
          } else {
            User.findOne({ email }).then((existingUser: any) => {
              if (isEmpty(existingUser)) {
                resolve({
                  status: 400,
                  message: ApiInfo.USER_NA,
                  data: {},
                });
              } else {
                User.updateOne({ email }, { $set: body }, (err, _res) => {
                  if (err) {
                    reject(err);
                  } else {
                    const token = generateToken(email, username);
                    resolve({
                      status: 200,
                      message: ApiInfo.USER_UPDATED,
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
          resolve({ status: 200, message: ApiInfo.USER_DELETED });
        } else {
          reject(new Error(HTTP_RES._500));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
) {
  try {
    const reqBody = req.body as Partial<IUserReq>;
    const reqQuery = req.query as Partial<IUserReq>;
    switch (req.method) {
      case HttpRequest.GET:
        if (!reqQuery.username) {
          throw new Error(HTTP_RES._400);
        } else {
          await getDoc(reqQuery).then((payload) =>
            forwardResponse(res, payload)
          );
        }
        break;
      case HttpRequest.POST:
        const {
          email = "",
          password = "",
          login = true,
          action = "",
        } = reqBody;
        if (action === APIAction.USER_TOKEN_LOGIN) {
          handleTokenLogin(req, res);
        } else if (!password || (!login && !email)) {
          throw new Error(HTTP_RES._400);
        } else {
          await (login ? handleLogin(reqBody) : createDoc(reqBody)).then(
            (payload) => forwardResponse(res, payload)
          );
        }
        break;
      case HttpRequest.PUT:
        validateAuth(req).then((valid) => {
          if (valid) {
            updateDoc(reqBody).then((payload) => forwardResponse(res, payload));
          } else {
            handleBadRequest(res);
          }
        });
        break;
      case HttpRequest.DELETE:
        validateAuth(req).then((valid) => {
          if (valid) {
            deleteDoc(reqBody).then((payload) => forwardResponse(res, payload));
          } else {
            handleBadRequest(res);
          }
        });
        break;
      default:
        handleBadRequest(res);
        break;
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
}
