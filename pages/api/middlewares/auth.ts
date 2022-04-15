import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { HTTP_RES } from "../../../enum";
import { verifyPassword } from "../../../lib/server/validation";
import { IUserReq } from "../../../types";
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
    const { email = "", username = "" } = req.body.user || {};
    let token: any = req.headers?.authorization || "Bearer ";
    token = token.split("Bearer ")[1];
    if (!token) {
      throw new Error(HTTP_RES._401);
    }
    token = jwt.verify(token, SECRET_KEY);
    const { username: _u, email: _e } = token;
    if (_e === email && (!username || _u === username)) {
      resolve(true);
    } else {
      reject(new Error(HTTP_RES._401));
    }
  });
}

export function verify(req: Partial<IUserReq>, userDoc: any) {
  return (
    req.username === userDoc.username &&
    verifyPassword(req.password, userDoc.password)
  );
}
