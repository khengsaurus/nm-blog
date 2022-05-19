import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import upload from "./middlewares/upload";

const route = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Process a POST request
route.post("/*", upload, (req, res) => {
  console.log("REQ RECEIVED, HERE IS THE FILE -----");
  console.log(req.file);
  return new Promise(async (resolve, reject) => {
    try {
      await upload(req, res, function (err) {
        if (err) {
          res.status(500).send("error in upload");
        } else {
          res.status(200).send("success");
        }
      });
      res.status(200).send("upload success");
    } catch (err) {
      console.info(err.message);
      res.status(500).send("upload failed");
    }
  });
});

export default route;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
