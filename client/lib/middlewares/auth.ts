import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { IUser } from "types";

const secretKey = process.env.SECRET_KEY;

export function validateAuth(req: NextApiRequest): Partial<IUser> | null {
  const userToken: any = req.headers?.["user-token"] || req.body?.token;
  if (!userToken) return null;
  return (jwt.verify(userToken, secretKey) as Partial<IUser>) || null;
}
