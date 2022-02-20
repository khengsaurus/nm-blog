import jwt from "jsonwebtoken";
import { WithId } from "mongodb";
import { NextApiRequest } from "next";
import { ApiError } from "../../../enum";
import { IUser, IUserReq } from "../../../types";
const SECRET_KEY = "secret-key";

export function generateToken(params: Partial<IUserReq>) {
  const { username, password } = params;
  return jwt.sign(
    {
      username,
      password,
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );
}

export function validateAuth(req: NextApiRequest) {
  const { username, password } = req.query;
  let token: any = req.headers?.authorization || "Bearer ";
  token = token.split("Bearer ")[1];
  if (!token) {
    throw new Error(ApiError.AUTH_HEADER_NA);
  }
  token = jwt.verify(token, SECRET_KEY);
  console.log(token);
  const { username: _u, password: _p } = token;
  return username === _u && password === _p;
}

export function verify(req: Partial<IUserReq>, userDoc: any) {
  return req.username === userDoc.username && req.password === userDoc.password;
}
