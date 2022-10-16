import { APIAction } from "enums";
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { IUserReq } from "types";
import { ServerError, verifyPassword } from "../server";

const secretKey = process.env.SECRET_KEY;

export function generateToken(
  id: string,
  email: string,
  username: string,
  isAdmin = false
) {
  return jwt.sign(
    {
      id,
      email,
      username,
      isAdmin,
    },
    secretKey,
    { expiresIn: "30d" }
  );
}

export function decodeToken<T>(req: NextApiRequest) {
  let { action, token } = req.body;
  if (action !== APIAction.USER_TOKEN_LOGIN) {
    token = req.headers?.usertoken as string;
  }
  return jwt.verify(token, secretKey) as T;
}

/**
 * @return Promise<boolean> true if valid auth, else false
 * @throws ServerError 401
 */
export async function validateAuth(req: NextApiRequest): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const userId = req.headers?.["user-id"];
    let userToken: any = req.headers?.["user-token"];
    if (!userToken) reject(new ServerError(401));
    userToken = jwt.verify(userToken, secretKey) as object;
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
