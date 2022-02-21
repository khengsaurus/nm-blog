import jwt from "jsonwebtoken";
import { WithId } from "mongodb";
import { NextApiRequest } from "next";
import { ApiError } from "../../../enum";
import { IUser, IUserReq } from "../../../types";
const SECRET_KEY = "secret-key";

export function generateToken(email: string, username: string) {
  return jwt.sign(
    {
      email,
      username,
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );
}

export async function validateAuth(req: NextApiRequest): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const { email = "", username = "" } = req.body?.user || {};
    let token: any = req.headers?.authorization || "Basic ";
    token = token.split("Basic ")[1];
    if (!token) {
      throw new Error(ApiError.AUTH_HEADER_NA);
    }
    token = jwt.verify(token, SECRET_KEY);
    const { username: _u, email: _e } = token;
    if (_e === email && (!username || _u === username)) {
      resolve(true);
    } else {
      reject(new Error(ApiError.AUTH_FAILED));
    }
  });
}

export function verify(req: Partial<IUserReq>, userDoc: any) {
  return req.username === userDoc.username && req.password === userDoc.password;
}
