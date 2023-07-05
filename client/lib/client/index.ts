import ClientHttpService from "./ClientHttpService";
import { HomeTheme, avatarStyles } from "./MuiStyles";
import NextHttpService from "./NextHttpService";
import markdown from "./markdown";
import {
  deleteFiles,
  deletePost,
  getPostSlugs,
  getPresignedS3URL,
  getUploadedFileKey,
} from "./tasks";
import themes from "./themes";

const nextHttpService = new NextHttpService();
const clientHttpService = new ClientHttpService();

export {
  HomeTheme,
  avatarStyles,
  clientHttpService,
  deleteFiles,
  deletePost,
  getPostSlugs,
  getPresignedS3URL,
  getUploadedFileKey,
  markdown,
  nextHttpService,
  themes,
};
