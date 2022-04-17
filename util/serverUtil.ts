import { extend } from "lodash";
import { NextApiResponse } from "next";
import { HttpResponse } from "../enum";

export function handleBadRequest(res: NextApiResponse, err?: Error) {
  console.info(err.message);
  res.status(400).json({ message: HttpResponse._400 });
  return;
}

export function handleInternalError(res: NextApiResponse, err?: Error) {
  console.info(err.message);
  res.status(500).json({ message: HttpResponse._500 });
  return;
}

export function processUserData(user: any) {
  return {
    username: user.username,
    email: user.email,
    avatar: user.avatar || "",
    bio: user.bio || "",
    cart: user.cart || [],
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
