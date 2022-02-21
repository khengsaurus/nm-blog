import { extend, isEmpty, reject } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, ApiInfo } from "../../enum";
import { mongodbConn } from "../../lib/mongodb";
import { IResponse, IUserReq } from "../../types";
import { generateToken, validateAuth, verify } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { forwardResponse } from "./middlewares/forwardResponse";

function createNewUser(params: Object) {
  const baseUser = {
    avatar: "",
    bio: "",
    color: "",
    createdAt: "",
    email: "",
    password: "",
    username: "",
    cart: null,
  };
  return extend(baseUser, params);
}

async function getQuery(params: object, limit = 1): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        if (limit === 1) {
          const ref = db.collection("users");
          await ref.findOne(params).then((data) => {
            if (isEmpty(data)) {
              resolve({ status: 200, message: ApiInfo.USER_NA });
            } else {
              resolve({
                status: 200,
                message: ApiInfo.USER_RETRIEVED,
                ...data,
              });
            }
          });
        }
      }
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
async function loginQuery(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { username, password } = reqBody;
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        ref.findOne({ username }).then((existingUser: any) => {
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
            delete existingUser.password;
            resolve({
              status: 200,
              message: ApiInfo.USER_LOGIN,
              data: { token, user: existingUser },
            });
          }
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * @param reqBody: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve {..., token: JWT, user: user object without username}
 */
async function registerQuery(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { email, password } = reqBody;
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        ref.findOne({ email }).then((existingUser: any) => {
          if (isEmpty(existingUser)) {
            // Create acc without setting username
            const user = createNewUser({ email, password });
            ref.insertOne(user).then((res) => {
              if (res.acknowledged) {
                const token = generateToken(email, email);
                delete user.password;
                resolve({
                  status: 200,
                  message: ApiInfo.EMAIL_AVAIL,
                  data: { token, user },
                });
              } else {
                console.info("MDB failed to acknowledge request");
                reject(new Error(ApiError.INTERNAL_500));
              }
            });
          } else {
            resolve({ status: 200, message: ApiInfo.EMAIL_USED });
          }
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}

async function putQuery(body: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        const { email, username } = body;
        // provide username only on req to change
        if (username) {
          ref.findOne({ username }).then((existingUser: any) => {
            if (!isEmpty(existingUser)) {
              resolve({
                status: 200,
                message: ApiInfo.USERNAME_TAKEN,
                data: {},
              });
            }
          });
        }
        ref.updateOne({ email }, { $set: body }, (err, _res) => {
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
    } catch (err) {
      reject(err);
    }
  });
}

async function deleteQuery(searchParams) {
  return new Promise(async (resolve, reject) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        // not working... doing it as per @see https://docs.mongodb.com/drivers/node/current/usage-examples/deleteOne/
        await ref.deleteOne(searchParams).then((res) => {
          if (res.acknowledged) {
            resolve({ status: 200, message: ApiInfo.USER_DELETED });
          } else {
            reject(new Error(ApiError.INTERNAL_500));
          }
        });
      }
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
    const reqParams = req.query as Partial<IUserReq>;
    let valid = false;
    switch (req.method) {
      case "GET":
        if (!reqParams.username) {
          throw new Error(ApiError.INVALID_FIELDS);
        } else {
          await getQuery(reqParams).then((payload) =>
            forwardResponse(res, payload)
          );
        }
        break;
      case "POST":
        const { email = "", password = "", login = true } = req.body;
        if (!password || (!login && !email)) {
          throw new Error(ApiError.INVALID_FIELDS);
        } else {
          await (login ? loginQuery(reqBody) : registerQuery(reqBody)).then(
            (payload) => forwardResponse(res, payload)
          );
        }
        break;
      case "PUT":
        valid = await validateAuth(req);
        if (valid) {
          await putQuery(reqBody).then((payload) =>
            forwardResponse(res, payload)
          );
        }
        break;
      case "DELETE":
        valid = await validateAuth(req);
        if (valid) {
          deleteQuery(reqBody);
        }
        res.status(200).json({ message: "delete ok" });
        break;
      default:
        res.status(400).json({ message: "Bad request" });
        break;
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
}
