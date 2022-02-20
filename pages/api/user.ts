import { extend, isEmpty } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, ApiInfo } from "../../enum";
import { mongodbConn } from "../../lib/mongodb";
import { IResponse, IUser } from "../../types";
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
          await ref.findOne(params).then((doc) => {
            if (isEmpty(doc)) {
              res({ status: 200, message: ApiInfo.USER_NA });
            } else {
              res({ status: 200, message: ApiInfo.USER_RETRIEVED, data: doc });
            }
          });
        }
      }
    } catch (err) {
      rej(err);
    }
  });
}

async function postQuery(params: object): Promise<IResponse> {
  return new Promise(async (res, rej) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        const ref = db.collection("users");
        ref.findOne(params).then((existingUser) => {
          if (isEmpty(existingUser)) {
            /**
             * No way to retrieve the inserted doc without another read
             * @see https://stackoverflow.com/questions/40766654
             */
            ref.insertOne(createNewUser(params)).then((doc) => {
              res({
                status: 200,
                message: ApiInfo.USER_REGISTERED,
                data: doc,
              });
            });
          } else {
            res({ status: 200, message: ApiInfo.USERNAME_TAKEN });
          }
        });
      }
    } catch (err) {
      rej(err);
    }
  });
}

async function putQuery(params: IUser): Promise<IResponse> {
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
  const userParams = req.query as unknown as IUser; // hacky af lol
  const { username = "", password = "" } = userParams;
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
          await postQuery({ username, password }).then((payload) =>
            forwardResponse(res, payload)
          );
          break;
        case "PUT":
          await putQuery(userParams).then((payload) =>
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
