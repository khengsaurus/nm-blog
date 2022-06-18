import { APIAction } from "enums";
import { handleRequest } from "lib/middlewares";
import { ServerError } from "lib/server";
import { deleteFile, generateUploadURL } from "lib/server/s3";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

const route = nextConnect({
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

route.get("/*", async (req, res) => {
  const action = req.query.action;
  if (action === APIAction.GET_UPLOAD_KEY) {
    handleRequest(req, res, getS3UploadURL);
  } else {
    res.status(401);
  }
});

async function getS3UploadURL() {
  return new Promise(async (resolve, reject) => {
    await generateUploadURL()
      .then((data) => resolve({ status: 200, data }))
      .catch((err) => reject(new ServerError(500, err?.message)));
  });
}

route.delete("/*", async (req, res) => handleRequest(req, res, deleteImage));

async function deleteImage(req) {
  return new Promise(async (resolve, reject) => {
    const { imageKey } = req.query;
    if (!imageKey) reject(new ServerError(400));
    await deleteFile(imageKey)
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

export default route;

export const config = {
  api: {
    bodyParser: false,
  },
};
