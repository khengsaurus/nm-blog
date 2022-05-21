import { HttpResponse } from "enums";
import { getFileStream, uploadFile } from "lib/server/s3";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { upload } from "../../lib/middlewares";

const route = nextConnect({
  // Handle any other HTTP method
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

route.post("/*", upload.single("image"), async (req, res) => {
  if (!!req.file) {
    try {
      const uploadRes = await uploadFile(req.file);
      if (!!uploadRes.Location && !!uploadRes.Key) {
        res.status(200).json({
          location: uploadRes.Location,
          key: uploadRes.Key,
        });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {
    res.status(400).send(HttpResponse._400);
  }
});

export default route;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
