import { extend, isEmpty } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RES, ApiInfo, DBService, HttpRequestType } from "../../enum";
import { mongodbConn } from "../../lib/server/mongodb";
import { hashPassword } from "../../lib/server/validation";
import { IResponse, IUserReq } from "../../types";
import { generateToken, validateAuth, verify } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { forwardResponse } from "./middlewares/forwardResponse";

function createObj(params: Object) {
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

/**
 * @param reqBody: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve {..., token: JWT, user: user object without username}
 */
async function createDoc(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { email, password } = reqBody;
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection(DBService.USERS);
        ref.findOne({ email }).then((existingUser: any) => {
          if (isEmpty(existingUser)) {
            // Create acc without setting username
            const user = createObj({ email, password: hashPassword(password) });
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
                reject(new Error(HTTP_RES._500));
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

async function getDoc(params: object, limit = 1): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { db } = await mongodbConn();
      if (limit === 1) {
        if (db) {
          const ref = db.collection(DBService.USERS);
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
async function runTransaction(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { username, password } = reqBody;
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection(DBService.USERS);
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

async function updateDoc(body: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection(DBService.USERS);
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

async function deleteDoc(searchParams) {
  return new Promise(async (resolve, reject) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection(DBService.USERS);
        // not working... doing it as per @see https://docs.mongodb.com/drivers/node/current/usage-examples/deleteOne/
        ref.deleteOne(searchParams).then((res) => {
          if (res.acknowledged) {
            resolve({ status: 200, message: ApiInfo.USER_DELETED });
          } else {
            reject(new Error(HTTP_RES._500));
          }
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}

function handleBadRequest(res: NextApiResponse) {
  res.status(400).json({ message: "Bad request" });
  return;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
) {
  try {
    const reqBody = req.body as Partial<IUserReq>;
    const reqParams = req.query as Partial<IUserReq>;
    switch (req.method) {
      case HttpRequestType.GET:
        if (!reqParams.username) {
          throw new Error(HTTP_RES._400);
        } else {
          await getDoc(reqParams).then((payload) =>
            forwardResponse(res, payload)
          );
        }
        break;
      case HttpRequestType.POST:
        const { email = "", password = "", login = true } = req.body;
        if (!password || (!login && !email)) {
          throw new Error(HTTP_RES._400);
        } else {
          await (login ? runTransaction(reqBody) : createDoc(reqBody)).then(
            (payload) => forwardResponse(res, payload)
          );
        }
        break;
      case HttpRequestType.PUT:
        validateAuth(req).then((valid) => {
          if (valid) {
            updateDoc(reqBody).then((payload) => forwardResponse(res, payload));
          } else {
            handleBadRequest(res);
          }
        });
        break;
      case HttpRequestType.DELETE:
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
