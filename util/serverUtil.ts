import { NextApiResponse } from "next";
import { ApiInfo } from "../enum";

export function resolve200(message?: ApiInfo, data?: any) {
  return Promise.resolve({ status: 200, message, data });
}

export function handleBadRequest(res: NextApiResponse) {
  res.status(400).json({ message: "Bad request" });
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
