import bcrypt from "bcryptjs";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { IS_DEV } from "../consts";
import { ServerInfo } from "../enums";
import { MongoConnectionPool, RedisConnectionPool } from "../lib";
import ServerError from "../lib/ServerError";

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

export function createUserObject(params: Object) {
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

/**
 * @return Promise<boolean> true if valid auth, else false
 * @throws ServerError 401
 */
export async function validateAuth(req: Request): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const userId = req.headers?.["user-id"];
    let userToken: any = req.headers?.["user-token"];
    if (!userToken) reject(new ServerError(401));
    userToken = jwt.verify(userToken, envSecretKey) as object;
    if (userToken?.id === userId) resolve(true);
    else reject(new ServerError(401));
  });
}

export function verify(req: Partial<IUserReq>, user: any) {
  return (
    req.username === user.username &&
    verifyPassword(req.password, user.password)
  );
}
