import { EXPERIMENT_RUNTIME } from "consts";
import { APIAction } from "enums";
import { handleRequest } from "lib/middlewares";
import { deleteFile, generateUploadURL, ServerError } from "lib/server";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

export const config = {
  api: { bodyParser: false },
  config: EXPERIMENT_RUNTIME,
};

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

route.delete("/*", async (req, res) => handleRequest(req, res, deleteCallback));

async function getS3UploadURL() {
  return new Promise(async (resolve, reject) => {
    await generateUploadURL()
      .then((data) => resolve({ status: 200, data }))
      .catch((err) => reject(new ServerError(500, err?.message)));
  });
}

async function deleteCallback(req) {
  return new Promise(async (resolve, reject) => {
    let { keys } = req.query;
    const _keys = JSON.parse(keys || []) as string[];
    if (!_keys?.length) reject(new ServerError(400));
    await deleteFile(_keys).then(resolve).catch(reject);
  });
}

export default route;
