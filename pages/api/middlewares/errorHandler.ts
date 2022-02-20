import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "../../../enum";
import { forwardResponse } from "./forwardResponse";

export function errorHandler(
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (err.message) {
    case ApiError.INTERNAL_500:
      console.info(err.message);
      console.info("Request URL: " + req.url);
      console.info("Query: " + JSON.stringify(req.query));
      console.info("Body: " + JSON.stringify(req.body));
      forwardResponse(res, { status: 500, message: ApiError.INTERNAL_500 });
      break;
    case ApiError.INVALID_FIELDS:
      forwardResponse(res, { status: 400, message: ApiError.INVALID_FIELDS });
  }
}
