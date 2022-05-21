import { extend } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { HttpResponse } from "../../enums";
import { ServerError } from "../server";
import { IResponse, IUser } from "../../types";
import { validateAuth } from "./auth";

export async function handleRequest<R>(
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (p: NextApiRequest) => Promise<IResponse>
) {
  await validateAuth(req)
    .then(async () => await callback(req))
    .then((payload) => forwardResponse(res, payload))
    .catch((err) => handleAPIError(res, err));
}

export function forwardResponse(res: NextApiResponse, payload: IResponse) {
  res
    .status(payload.status)
    .json({ message: payload.message, ...payload.data });
}

export function handleBadRequest(res: NextApiResponse, err?: Error) {
  return Promise.resolve().then(() => {
    console.info(err.message);
    res.status(400).json({ message: HttpResponse._400 });
  });
}

export function handleAPIError(res: NextApiResponse, err?: ServerError) {
  console.info(err.status + " : " + err.message);
  res.status(err.status).json({ message: err.message });
  return;
}

export function errorHandler(
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (err.message) {
    case HttpResponse._500:
      console.info(err.message);
      console.info("Request URL: " + req.url);
      console.info("Query: " + JSON.stringify(req.query));
      console.info("Body: " + JSON.stringify(req.body));
      forwardResponse(res, { status: 500, message: HttpResponse._500 });
      break;
    case HttpResponse._400:
      forwardResponse(res, { status: 400, message: HttpResponse._400 });
  }
}

export function processUserData(user: any, id: string): Partial<IUser> {
  return {
    id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || "",
    bio: user.bio || "",
    posts: user.posts || [],
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
    posts: [],
  };
  return extend(baseUser, params);
}
