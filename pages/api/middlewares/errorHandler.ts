import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RES } from "../../../enum";
import { forwardResponse } from "./forwardResponse";

export function errorHandler(
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (err.message) {
    case HTTP_RES._500:
      console.info(err.message);
      console.info("Request URL: " + req.url);
      console.info("Query: " + JSON.stringify(req.query));
      console.info("Body: " + JSON.stringify(req.body));
      forwardResponse(res, { status: 500, message: HTTP_RES._500 });
      break;
    case HTTP_RES._400:
      forwardResponse(res, { status: 400, message: HTTP_RES._400 });
  }
}
