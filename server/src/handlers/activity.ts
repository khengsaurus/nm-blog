import express from "express";
import { ServerInfo } from "../enums";
import { MongoConnectionPool, RedisConnectionPool } from "../lib";

const activityHandler = express.Router();

activityHandler.head("/ping", async (_, res) => res.status(200).send("Ok"));

activityHandler.get("/info", (_, res) => {
  const mongo = MongoConnectionPool.getInfo();
  const redis = RedisConnectionPool.getInfo();

  res.status(200).json({
    status: ServerInfo.SERVER_ACTIVE,
    mongo,
    redis,
  });
});

export default activityHandler;
