import express, { type Request, type Response } from "express";
import isEmpty from "lodash.isempty";
import { IS_DEV } from "../consts";
import { APIAction, ErrorMessage, ServerInfo } from "../enums";
import { castAsBoolean, hashPassword } from "../utils";
import {
  createUserObject,
  generateToken,
  handleMongoConn,
  processUserData,
  verify,
} from "./util";

const userHandler = express.Router();

userHandler.get("/*", (req, res) => {
  switch (req.query?.action) {
    case APIAction.GET_POST_SLUGS:
      return getSlugs(req, res);
    default:
      return getByQuery(req, res);
  }
});

async function getSlugs(req: Request, res: Response) {
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  try {
    await mongoConn
      .findUser({ username: req.query.username })
      .populate(
        "posts",
        "-__v -user -username -title -body -isPrivate -createdAt -updatedAt -imageKey"
      )
      .then((userData) => {
        const user = userData?._doc;
        res.status(200).json({
          message: ServerInfo.POST_SLUGS_RETRIEVED,
          user: processUserData(user, user._id),
        });
      });
  } catch (err) {
    res.status(500).json({ error: true, message: err?.message });
  }
}

async function getByQuery(req: Request, res: Response) {
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  const {
    id,
    isPrivate,
    action /* should be undefined */,
    ...restQuery
  }: Partial<IUserReq> = req.query;

  await (id
    ? mongoConn.findUserById(id as string)
    : mongoConn.findUser(restQuery)
  )
    .then((userData) => {
      const user = userData?._doc;
      if (isEmpty(user)) {
        res.status(200).json({ error: true, message: ServerInfo.USER_NA });
      } else {
        res.status(200).json({
          message: ServerInfo.USER_RETRIEVED,
          user: processUserData(user, user._id, castAsBoolean(isPrivate)),
        });
      }
    })
    .catch((err) =>
      res.status(500).json({
        error: true,
        message: `${ErrorMessage.U_RETRIEVE_FAILED}, trace: ${err?.message}`,
      })
    );
}

userHandler.post("/*", async (req, res) => {
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  let { action, username, email, password } = req.body as Partial<IUserReq>;
  (action === APIAction.LOGIN
    ? mongoConn.findUser({ username }).then((userData) => {
        const user = userData?._doc;
        if (isEmpty(user) || !verify({ username, password }, user)) {
          return res.status(200).json({
            message: ServerInfo.USER_BAD_LOGIN,
            data: { token: null },
          });
        } else {
          const { _id, email, isAdmin } = user;
          return res.status(200).json({
            message: ServerInfo.USER_LOGIN,
            data: {
              token: generateToken(_id, email, username, isAdmin || IS_DEV),
              user: processUserData(user, _id, true),
            },
          });
        }
      })
    : mongoConn.checkUserExists({ email }).then((exists) => {
        if (exists) {
          return res
            .status(200)
            .json({ error: true, message: ServerInfo.EMAIL_USED });
        } else {
          // Create acc without setting username
          password = hashPassword(password);
          const user = createUserObject({ email, password });
          mongoConn.createUser(user).then((newUser) => {
            if (newUser.id) {
              res.status(200).json({
                message: ServerInfo.USER_REGISTERED,
                user: processUserData(user, newUser.id, true),
                // username not set, use email in place of username
                token: generateToken(newUser.id, email, email),
              });
            } else {
              throw new Error(ErrorMessage.FAILED_TO_GEN_TOKEN);
            }
          });
        }
      })
  ).catch((err) =>
    res.status(500).json({ error: true, message: err?.message })
  );
});

userHandler.patch("/*", async (req, res) => {
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  try {
    const { action, ...updatedUser } = req.body as Partial<IUserReq>;
    const { email, username, userId } = updatedUser;
    let user;

    if (action === APIAction.USER_SET_USERNAME) {
      await mongoConn.checkUserExists({ username }).then(async (exists) => {
        if (exists) {
          return res.status(200).json({ message: ServerInfo.USERNAME_TAKEN });
        }
        user = await mongoConn.findUserById(userId);
        user.username = username;
      });
    } else {
      user = await mongoConn.findUserById(userId);
      for (const key of Object.keys(updatedUser)) {
        user[key] = updatedUser[key];
      }
    }
    user
      .save()
      .then((userData) => {
        const user = userData?._doc;
        res.status(200).json({
          message: ServerInfo.USER_UPDATED,
          user: processUserData(user, user._id, true),
          token: generateToken(user._id, email, username, user.isAdmin),
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: `${ErrorMessage.U_UPDATE_FAILED}, trace: ${err?.message}`,
    });
  }
});

userHandler.delete("/*", async (req, res) => {
  const { userId } = req.query as { userId: string };
  if (!userId) return res.status(400);

  console.log(userId);

  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  await mongoConn
    .deleteUser(userId)
    .then((_) => res.status(200).json({ message: ServerInfo.USER_DELETED }))
    .catch((err) =>
      res.status(500).json({
        error: true,
        message: `${ErrorMessage.U_DELETE_FAILED}, trace: ${err?.message}`,
      })
    );
});

export default userHandler;
