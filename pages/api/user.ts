import { extend, isEmpty } from "lodash";
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
  return new Promise(async (res, rej) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        if (limit === 1) {
          await ref.findOne(params).then((data) => {
            if (isEmpty(data)) {
              res({ status: 200, message: ApiInfo.USER_NA });
            } else {
              res({ status: 200, message: ApiInfo.USER_RETRIEVED, data });
            }
          });
        }
      }
    } catch (err) {
      rej(err);
    }
  });
}

/**
 * @param params: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve Login: {..., token: JWT}
 * @resolve Register: {..., user: object, token: JWT}
 */
async function postQuery(params: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (res, rej) => {
    const { username, password, login } = params;
    const _p = { username, password };
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        ref.findOne({ username }).then((existingUser: any) => {
          if (login && !isEmpty(existingUser)) {
            if (verify(_p, existingUser)) {
              const token = generateToken(_p);
              res({
                status: 200,
                message: ApiInfo.USER_LOGIN,
                data: { token },
              });
            } else {
              res({
                status: 200,
                message: ApiInfo.USER_LOGIN_WRONG_CREDENTIALS,
                data: {},
              });
            }
          } else {
            // Handle register
            if (isEmpty(existingUser)) {
              const user = createNewUser(_p);
              ref.insertOne(user).then((data) => {
                if (data?.acknowledged) {
                  const token = generateToken(user);
                  res({
                    status: 200,
                    message: ApiInfo.USER_REGISTERED,
                    data: { ...data, user, token },
                  });
                }
              });
            } else {
              res({ status: 200, message: ApiInfo.USERNAME_TAKEN });
            }
          }
        });
      }
    } catch (err) {
      rej(err);
    }
  });
}

async function putQuery(params: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (res, rej) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        const user = { username: params.username };
        const updatedUser = { $set: params };
        ref.updateOne(user, updatedUser, (err, _res) => {
          if (err) {
            rej(err);
          } else {
            res({
              status: 200,
              message: ApiInfo.USER_UPDATED,
              data: _res,
            });
          }
        });
      }
    } catch (err) {
      rej(err);
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
) {
  const reqParams = req.query as unknown as Partial<IUserReq>; // hacky af lol
  const { username = "", login = true } = reqParams;
  const { password = "" } = req.body;
  try {
    if (!username) {
      throw new Error(ApiError.INVALID_FIELDS);
    } else {
      switch (req.method) {
        case "GET":
          await getQuery({ username }).then((payload) =>
            forwardResponse(res, payload)
          );
          break;
        case "POST":
          if (!password) {
            throw new Error(ApiError.INVALID_FIELDS);
          }
          await postQuery({ username, password, login }).then((payload) =>
            forwardResponse(res, payload)
          );
          break;
        case "PUT":
          validateAuth(req);
          await putQuery(reqParams).then((payload) =>
            forwardResponse(res, payload)
          );
          break;
        case "DELETE":
          res.status(200).json({ message: "delete ok" });
          break;
        default:
          res.status(400).json({ message: "Bad request" });
          break;
      }
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
}

// userApi.post("/create", async (req, res, next) => {
//   const { username = "", email = "", password = "" } = req.body;
//   if (!username || !email || !password) {
//     res.status(400);
//     res.send(`Required fields not provided`);
//   } else {
//     try {
//       await UserModel.findOne({ username }).then((doc) => {
//         res.status(200);
//         if (isEmpty(doc)) {
//           createUser(email, username, password).then(() => {
//             res.send(`User doc created successfully`);
//           });
//         } else {
//           res.send(`Username already taken`);
//         }
//       });
//     } catch (err) {
//       res.status(500);
//       res.send(`Server failed to register user`);
//     }
//   }
// });

// async function createUser(email: String, username: String, password: String) {
//   const newUser = new UserModel({
//     email,
//     username,
//     password,
//     avatar: "",
//     bio: "",
//     color: "",
//     createdAt: "",
//     cart: null,
//   });
//   await newUser.save();
// }

// export default userApi;
