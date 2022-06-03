import fs from "fs";
import { handleRequest, upload } from "lib/middlewares";
import { ServerError } from "lib/server";
import { deleteFile, getFileStream, uploadFile } from "lib/server/s3";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

const route = nextConnect({
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

route.get("/*", (req, res) => {
  const key = req.query.key;
  if (key) {
    const readStream = getFileStream(key);
    readStream.pipe(res);
  }
});

route.post("/*", upload.single("image"), async (req, res) =>
  handleRequest(req, res, uploadImage)
);

route.delete("/*", async (req, res) => {
  handleRequest(req, res, deleteImage);
});

export default route;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

async function uploadImage(req) {
  return new Promise(async (resolve, reject) => {
    if (!!req.file) {
      try {
        const uploadRes = await uploadFile(req.file);
        if (!!uploadRes.Location && !!uploadRes.Key) {
          resolve({
            status: 200,
            data: {
              location: uploadRes.Location,
              key: uploadRes.Key,
            },
          });
        }
      } catch (err) {
        reject(new ServerError(500, err.message));
      } finally {
        fs.unlink(req.file.path, () =>
          console.info("File unlinked: " + req.file.path)
        );
      }
    } else {
      reject(new ServerError(400));
    }
  });
}

async function deleteImage(req) {
  return new Promise(async (resolve, reject) => {
    const { imageKey } = req.query;
    if (!imageKey) reject(new ServerError(400));
    await deleteFile(imageKey)
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}
