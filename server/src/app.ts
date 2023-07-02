import cors from "cors";
import express from "express";
import { activityHandler, postHandler, postsHandler } from "./handlers";
import { errorHandler, setHeaders } from "./middlewares";
import userHandler from "./handlers/user";

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.enable("trust proxy");
app.use(setHeaders(6 * 60 * 60));

app.get("/", (_, res) => res.send("Server ready").status(200));
app.use("/activity", activityHandler);
app.use("/post", postHandler);
app.use("/posts", postsHandler);
app.use("/user", userHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
