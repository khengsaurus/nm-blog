import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

type Data = {
  message?: string;
  data?: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case "GET":
      res.status(200).json({ data: "John Doe" });
      break;
    case "POST":
      res.status(200).json({ message: "ok" });
      break;
    default:
      res.status(400).json({ message: "Bad request" });
      break;
  }
}
