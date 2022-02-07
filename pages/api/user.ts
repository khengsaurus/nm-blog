import type { NextApiRequest, NextApiResponse } from "next";
import { mongodbConn } from "../../lib/mongodb";

type Data = {
  message?: string;
  data?: any;
};

async function getQuery(params: object, limit = 1) {
  return new Promise(async (res, rej) => {
    const { db } = await mongodbConn();
    if (db) {
      const ref = db.collection("users");
      if (limit === 1) {
        await ref.findOne(params).then((doc) => res(doc));
      }
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | any>
) {
  // console.log(req.headers);
  // console.log(req.cookies);
  // console.log(req.query);
  // console.log(req.body);
  switch (req.method) {
    case "GET":
      const { username } = req.query;
      if (!username) {
        res.status(400);
        res.send({ message: "Required fields not provided" });
      } else {
        try {
          await getQuery({ username }).then((doc) => {
            if (doc) {
              res.status(200);
              res.json(doc); // -> res: { ..., data:doc }
            }
          });
        } catch (err) {
          res.status(500);
          res.json({ msg: `Server failed to retrieve user information` });
        }
      }
      break;
    case "POST":
      res.status(200).json({ message: "post ok" });
      break;
    case "PUT":
      res.status(200).json({ message: "put ok" });
      break;
    case "DELETE":
      res.status(200).json({ message: "delete ok" });
      break;
    default:
      res.status(400).json({ message: "Bad request" });
      break;
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
