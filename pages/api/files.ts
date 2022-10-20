import { EXPERIMENTAL_RUNTIME } from "consts";
import { APIAction, HttpRequest } from "enums";
import { handleBadRequest, handleRequest } from "lib/middlewares";
import {
  deleteFile,
  generateDownloadURL,
  generateUploadURL,
  ServerError,
} from "lib/server";
import { NextApiRequest, NextApiResponse } from "next";

export const config = EXPERIMENTAL_RUNTIME;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.POST:
      const action = req.body.action;
      switch (action) {
        case APIAction.GET_UPLOAD_KEY:
          return handleRequest(req, res, () => getS3UploadURL(req));
        case APIAction.GET_DOWNLOAD_KEY:
          return handleRequest(req, res, () => getS3DownloadURL(req));
        default:
          return res.status(400);
      }
    case HttpRequest.DELETE:
      return handleRequest(req, res, deleteCallback);
    default:
      return handleBadRequest(res);
  }
}

async function getS3UploadURL(req: NextApiRequest) {
  const { userId } = req.body;
  return new Promise(async (resolve, reject) => {
    if (!userId) reject(new ServerError(400));
    await generateUploadURL(userId)
      .then((data) => resolve({ status: 200, data }))
      .catch((err) => reject(new ServerError(500, err?.message)));
  });
}

async function getS3DownloadURL(req: NextApiRequest) {
  return new Promise(async (resolve, reject) => {
    const { key } = req.body;
    if (key && typeof key === "string") {
      generateDownloadURL(key)
        .then((data) => resolve({ status: 200, data }))
        .catch((err) => reject(new ServerError(500, err?.message)));
    } else {
      reject(new ServerError(400));
    }
  });
}

async function deleteCallback(req) {
  return new Promise(async (resolve, reject) => {
    let { keys } = req.query;
    const _keys = JSON.parse(keys || "") as string[];
    if (!_keys?.length) reject(new ServerError(400));
    await deleteFile(_keys).then(resolve).catch(reject);
  });
}
