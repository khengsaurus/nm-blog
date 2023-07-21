import { ApiAction } from "enums";
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { ServerError } from "../server";

const secretKey = process.env.SECRET_KEY;

export function decodeToken<T>(req: NextApiRequest) {
  let { action, token } = req.body;
  if (action !== ApiAction.USER_TOKEN_LOGIN) {
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
    let userToken: any = req.headers?.["user-token"];
    userToken = jwt.verify(userToken, secretKey) as object;
    if (!userToken?.id) reject(new ServerError(401));
    else resolve(true);
  });
}
