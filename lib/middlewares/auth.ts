import { APIAction } from "enums";
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { IUserReq } from "types";
import { ServerError, verifyPassword } from "../server";
const SECRET_KEY = "secret-key";

export function generateToken(email: string, username: string, id: string) {
  return jwt.sign(
    {
      email,
      username,
      id,
    },
    SECRET_KEY,
    { expiresIn: "30d" }
  );
}

export function decodeToken<T>(req: NextApiRequest) {
  let { action, token } = req.body;
  if (action !== APIAction.USER_TOKEN_LOGIN) {
    token = req.headers?.usertoken as string;
  }
  return jwt.verify(token, SECRET_KEY) as T;
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
    userToken = jwt.verify(userToken, SECRET_KEY) as object;
    if (userToken?.id === userId) resolve(true);
    else reject(new ServerError(401));
  });
}

export function verify(req: Partial<IUserReq>, userDoc: any) {
  return (
    req.username === userDoc.username &&
    verifyPassword(req.password, userDoc.password)
  );
}
