import { NextFunction, Request, Response } from "express";

export function errorHandler(req, res) {
  console.info(
    `Failed ${req?.method} request, res.statusCode: ${res?.statusCode}, originalUrl: ${req?.originalUrl}, params: ${req?.params}, query: ${req?.query}`
  );
  switch (res?.statusCode) {
    case 400:
      res.json({ message: "Bad request!" });
      break;
    case 404:
      res.json({ message: "Failed to find resource" });
      break;
    default:
      res.status(500);
      res.json({ message: "Internal server error" });
      break;
  }
}

export function setHeaders(cacheDuration = 600) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", `public, max-age=${cacheDuration}`);
    } else {
      res.setHeader("Cache-Control", "no-store");
    }
    next();
  };
}
