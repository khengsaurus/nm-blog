import { ErrorMessage } from "enums";
import { NextApiRequest, NextApiResponse } from "next";
import { IResponse } from "types";
import { ServerError } from "../server";
import { validateAuth } from "./auth";

export async function handleAuthRequest(
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
  const { status, message, data } = payload;
  res.status(status).json({
    message,
    ...data,
  });
}

export function throwAPIError(
  reject: (error: ServerError) => void,
  err: Error,
  message: ErrorMessage
) {
  console.info(`${message}: ${err?.message}`);
  reject(new ServerError(500, message));
}

export function handleAPIError(res: NextApiResponse, err?: ServerError) {
  err && console.info(err.status + " : " + err.message);
  res.status(err.status).json({ message: err.message });
  return;
}
