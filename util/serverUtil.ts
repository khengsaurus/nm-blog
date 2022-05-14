import { extend } from "lodash";
import { NextApiResponse } from "next";
import { HttpResponse } from "../enums";
import ServerError from "../lib/server/ServerError";
import { IUser } from "../types";

export function handleBadRequest(res: NextApiResponse, err?: Error) {
  console.info(err.message);
  res.status(400).json({ message: HttpResponse._400 });
  return;
}

export function handleAPIError(res: NextApiResponse, err?: ServerError) {
  console.info(err.status + " : " + err.message);
  res.status(err.status).json({ message: err.message });
  return;
}

export function processUserData(user: any, id: string): Partial<IUser> {
  return {
    id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || "",
    bio: user.bio || "",
  };
}

export function createUserObject(params: Object) {
  const baseUser = {
    avatar: "",
    bio: "",
    createdAt: "",
    email: "",
    password: "",
    username: "",
    cart: null,
  };
  return extend(baseUser, params);
}
