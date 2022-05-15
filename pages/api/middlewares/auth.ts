import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { ServerError, verifyPassword } from "../../../lib/server";
import { IUserReq } from "../../../types";
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
  let token: any = req.headers?.authorization || "Bearer ";
  token = token.split("Bearer ")[1];
  return jwt.verify(token, SECRET_KEY) as T;
}

/**
 * @return Promise<boolean> true if valid auth, else false
 * @throws ServerError 401
 */
export async function validateAuth(req: NextApiRequest): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const { userId = "" } = req.body;
    let token: any = req.headers?.authorization || "Bearer ";
    token = token.split("Bearer ")[1];
    if (!token) {
      reject(new ServerError(401));
    }
    token = jwt.verify(token, SECRET_KEY) as object;
    if (token?.id === userId) {
      resolve(true);
    } else {
      reject(new ServerError(401));
    }
  });
}

export function verify(req: Partial<IUserReq>, userDoc: any) {
  return (
    req.username === userDoc.username &&
    verifyPassword(req.password, userDoc.password)
  );
}
