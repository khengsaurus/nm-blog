import express, { type Request, type Response } from "express";
import isEmpty from "lodash.isempty";
import { APIAction, ErrorMessage, ServerInfo } from "../enums";
import { castAsBoolean, hashPassword } from "../utils";
import {
  createUserObject,
  forwardAuthResponse,
  generateToken,
  handleAuth,
  handleMongoConn,
  processUserData,
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
  const { id, username } = handleAuth(req, res) || {};
  if (!id) return;

  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  try {
    await mongoConn
      .findUser({ username })
      .populate(
        "posts",
        "-__v -user -username -title -body -isPrivate -createdAt -updatedAt -imageKey"
      )
      .then((userData) => {
        const user = userData?._doc;
        res.status(200).json({
          message: ServerInfo.POST_SLUGS_RETRIEVED,
          user: processUserData(user, user._id?.toString()),
        });
      });
  } catch (err) {
    res.status(500).json({ error: true, message: err?.message });
  }
}

async function getByQuery(req: Request, res: Response) {
  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { id, isPrivate, action, ...restQuery }: Partial<IUserReq> = req.query;

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
          user: processUserData(
            user,
            user._id?.toString(),
            castAsBoolean(isPrivate)
          ),
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
  const {
    action,
    username,
    email,
    password: _password,
  } = req.body as Partial<IUserReq>;

  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  if (action === APIAction.USER_TOKEN_LOGIN) {
    const { id } = handleAuth(req, res) || {};
    if (!id) return;

    return mongoConn
      .findUserById(id)
      .then((userData) => forwardAuthResponse(res, userData?._doc))
      .catch((err) =>
        res.status(500).json({ error: true, message: err?.message })
      );
  }

  if (action === APIAction.LOGIN) {
    return mongoConn
      .findUser({ username })
      .then((userData) => forwardAuthResponse(res, userData?._doc))
      .catch((err) =>
        res.status(500).json({ error: true, message: err?.message })
      );
  }

  return mongoConn
    .checkUserExists({ email })
    .then((exists) => {
      if (exists) {
        return res
          .status(200)
          .json({ error: true, message: ServerInfo.EMAIL_USED });
      } else {
        // create acc without setting username
        const password = hashPassword(_password);
        const user = createUserObject({ email, password });
        mongoConn.createUser(user).then((newUser) => {
          if (newUser.id) {
            return res.status(200).json({
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
    .catch((err) =>
      res.status(500).json({ error: true, message: err?.message })
    );
});

userHandler.patch("/*", async (req, res) => {
  const { id, email } = handleAuth(req, res) || {};
  if (!id) return;

  const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
  if (mongoErrorStatus) return;

  const { action, ...updatedUserInfo } = req.body as Partial<IUserReq>;

  try {
    let editOk = true;
    if (action === APIAction.USER_SET_USERNAME) {
      if (email !== updatedUserInfo?.email) return res.sendStatus(401);

      await mongoConn
        .checkUserExists({ username: updatedUserInfo.username })
        .then(async (exists) => {
          if (exists) {
            res.status(200).json({ message: ServerInfo.USERNAME_TAKEN });
            editOk = false;
          }
        })
        .catch((err) =>
          res.status(500).json({ error: true, message: err?.message })
        );
    }

    if (!editOk) return;

    const existingUser = await mongoConn.findUser({ email });
    if (action === APIAction.USER_SET_USERNAME) {
      existingUser.username = updatedUserInfo.username;
    } else {
      for (const [key, value] of Object.entries(updatedUserInfo)) {
        existingUser[key] = value;
      }
    }

    await existingUser.save().then((userData) => {
      const updatedUser = userData?._doc;
      const { email, username, isAdmin } = updatedUser;
      const id = updatedUser?._id?.toString();
      res.status(200).json({
        message: ServerInfo.USER_UPDATED,
        user: processUserData(updatedUser, id, true),
        token: generateToken(id, email, username, isAdmin),
      });
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: `${ErrorMessage.U_UPDATE_FAILED}, trace: ${err?.message}`,
    });
  }
});

// userHandler.delete("/*", async (req, res) => {
//   const { userId } = req.query as { userId: string };
//   if (!userId) return res.status(400);

//   const { mongoErrorStatus, mongoConn } = await handleMongoConn(req, res);
//   if (mongoErrorStatus) return;

//   await mongoConn
//     .deleteUser(userId)
//     .then(() => res.status(200).json({ message: ServerInfo.USER_DELETED }))
//     .catch((err) =>
//       res.status(500).json({
//         error: true,
//         message: `${ErrorMessage.U_DELETE_FAILED}, trace: ${err?.message}`,
//       })
//     );
// });

export default userHandler;
