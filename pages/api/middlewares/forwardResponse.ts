import { NextApiResponse } from "next";
import { IResponse } from "../../../types";

export function forwardResponse(res: NextApiResponse, payload: IResponse) {
  res.status(payload.status);
  res.json({ message: payload.message, ...payload.data }); // will be under data
}
