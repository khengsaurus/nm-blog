import { NextApiRequest, NextApiResponse } from "next";
import { IResponse } from "../../types";
import { errorHandler } from "./middlewares/errorHandler";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
) {
  try {
    res.status(200).json({ message: "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit" });
  } catch (err) {
    errorHandler(err, req, res);
  }
}
