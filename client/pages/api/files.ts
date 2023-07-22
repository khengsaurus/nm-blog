import { EXPERIMENTAL_RUNTIME } from "consts";
import { ApiAction, HttpRequest } from "enums";
import { handleAuthRequest } from "lib/middlewares";
import {
  ServerError,
  deleteFile,
  generateDownloadURL,
  generateUploadURL,
} from "lib/server";
import { NextApiRequest, NextApiResponse } from "next";
import { IUser } from "types";

export const config = EXPERIMENTAL_RUNTIME;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.POST:
      switch (req.body.action) {
        case ApiAction.GET_UPLOAD_KEY:
          return handleAuthRequest(req, res, (_, tokenUser) =>
            getS3UploadURL(tokenUser)
          );
        case ApiAction.GET_DOWNLOAD_KEY:
          return handleAuthRequest(req, res, () => getS3DownloadURL(req));
        default:
          return res.status(400);
      }
    case HttpRequest.DELETE:
      return handleAuthRequest(req, res, deleteCallback);
    default:
      return res.status(405);
  }
}

async function getS3UploadURL(tokenUser: Partial<IUser>) {
  return new Promise(async (resolve, reject) => {
    if (!tokenUser?.id) reject(new ServerError(400));

    await generateUploadURL(tokenUser.id)
      .then((data) => resolve({ status: 200, ...data }))
      .catch((err) => reject(new ServerError(500, err?.message)));
  });
}

async function getS3DownloadURL(req: NextApiRequest) {
  return new Promise(async (resolve, reject) => {
    const { key } = req.body;
    if (key && typeof key === "string") {
      generateDownloadURL(key)
        .then((data) => resolve({ status: 200, ...data }))
        .catch((err) => reject(new ServerError(500, err?.message)));
    } else {
      reject(new ServerError(400));
    }
  });
}

async function deleteCallback(req) {
  return new Promise(async (resolve, reject) => {
    const _keys = JSON.parse(req.query?.keys || "") as string[];
    if (!_keys?.length) reject(new ServerError(400));
    await deleteFile(_keys).then(resolve).catch(reject);
  });
}
