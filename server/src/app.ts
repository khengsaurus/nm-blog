import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  activityHandler,
  postHandler,
  postsHandler,
  userHandler,
} from "./handlers";
import { errorHandler, setCacheControl } from "./middlewares";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.enable("trust proxy");
app.use(setCacheControl());

app.get("/", (_, res) => res.send("Server ready").status(200));
app.use("/activity", activityHandler);
app.use("/posts", postsHandler);
app.use("/post", postHandler);
app.use("/user", userHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
