import bcrypt from "bcryptjs";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import isEmpty from "lodash.isempty";
import { IS_DEV } from "../consts";
import { ServerInfo } from "../enums";
import { MongoConnectionPool, RedisConnectionPool } from "../lib";

const envSecretKey = process.env.SECRET_KEY || "secret-key";

export async function handleMongoConn(
  req: Request,
  res: Response,
  skipError = false
) {
  const { errorStatus: mongoErrorStatus, conn: mongoConn } =
    await MongoConnectionPool.getConnection(getClientIp(req));
  if (mongoErrorStatus && !skipError) {
    res
      .status(500)
      .json({ message: ServerInfo.MONGO_CONNECTION_FAIL, error: true });
  }
  return { mongoErrorStatus, mongoConn };
}

export async function handleRedisConn(
  req: Request,
  res: Response,
  skipResError = false
) {
  const { errorStatus: redisErrorStatus, conn: redisConn } =
    await RedisConnectionPool.getConnection(getClientIp(req));
  if (redisErrorStatus && !skipResError) {
    res
      .status(500)
      .json({ message: ServerInfo.REDIS_CONNECTION_FAIL, error: true });
  }

  return { redisErrorStatus, redisConn };
}

function getClientIp(req: Request) {
  return (
    (req.headers["x-client-ip"] as string) ||
    (req.headers["x-forwarded-for"] as string) ||
    req.socket?.remoteAddress ||
    String(Math.random())
  );
}

export function processUserData(
  user: any,
  id: string,
  forSelf = false
): Partial<IUser> {
  const posts = [];
  if (user.posts?.length > 0) {
    try {
      user.posts.forEach(({ slug, _id }) => {
        posts.push(new Object({ slug, id: _id.toString() }));
      });
    } catch (err) {
      console.info("Failed to parse user data: " + err.message);
    }
  }
  const { email, username, isAdmin, avatarKey = "", bio = "" } = user;
  const _user = { id, email, username, avatarKey, bio, posts };
  return forSelf ? { ..._user, isAdmin } : _user;
}

export function createUserObject(params: object) {
  const baseUser = {
    avatar: "",
    bio: "",
    email: "",
    password: "",
    username: "",
    isAdmin: IS_DEV,
    posts: [],
  };
  return { ...baseUser, ...params };
}

export function generateToken(
  id: string,
  email: string,
  username: string,
  isAdmin = IS_DEV
) {
  if (!process.env.SECRET_KEY) {
    console.error("process env var SECRET_KEY not loaded!");
    return null;
  }
  return jwt.sign({ id, email, username, isAdmin }, envSecretKey);
}

function verifyPassword(pw: string, hash: string) {
  return bcrypt.compareSync(pw, hash);
}

export function validateAuth(req: Request, id?: string): Partial<IUser> | null {
  const userToken = req.headers?.["user-token"] || req.body?.token;
  if (!userToken) return null;
  const user = jwt.verify(userToken, envSecretKey) as Partial<IUser>;
  return !id || id === user?.id ? user : null;
}

export function handleAuth(req: Request, res: Response): Partial<IUser> | null {
  const user = validateAuth(req);
  if (!user) res.sendStatus(401);
  return user;
}

export function verify(req: Partial<IUserReq>, user: Partial<IUser>) {
  return (
    req.username === user.username &&
    verifyPassword(req.password, user.password)
  );
}

export function forwardAuthResponse(
  res: Response,
  user: IUser,
  username?: string,
  password?: string
) {
  if (isEmpty(user)) {
    return res.status(200).json({
      message: ServerInfo.USER_BAD_LOGIN,
      token: null,
    });
  }
  if (username && password && !verify({ username, password }, user)) {
    return res.status(200).json({
      message: ServerInfo.USER_BAD_LOGIN,
      token: null,
    });
  }

  const { _id, email, isAdmin } = user;
  const id = _id.toString();
  return res.status(200).json({
    message: ServerInfo.USER_LOGIN,
    token: generateToken(id, email, user.username, isAdmin),
    user: processUserData(user, id, true),
  });
}
