import { NextApiRequest, NextApiResponse } from "next";
import { HttpResponse } from "../../../enums";
import { forwardResponse } from "./forwardResponse";

export function errorHandler(
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (err.message) {
    case HttpResponse._500:
      console.info(err.message);
      console.info("Request URL: " + req.url);
      console.info("Query: " + JSON.stringify(req.query));
      console.info("Body: " + JSON.stringify(req.body));
      forwardResponse(res, { status: 500, message: HttpResponse._500 });
      break;
    case HttpResponse._400:
      forwardResponse(res, { status: 400, message: HttpResponse._400 });
  }
}
