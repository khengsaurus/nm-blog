import ClientHTTPService from "./ClientHttpService";
import { HomeTheme, avatarStyles } from "./MuiStyles";
import markdown from "./markdown";
import {
  deleteFiles,
  deletePost,
  getPostSlugs,
  getPresignedS3URL,
  getUploadedFileKey,
} from "./tasks";
import themes from "./themes";

const HTTPService = new ClientHTTPService();

export {
  avatarStyles,
  HTTPService,
  themes,
  HomeTheme,
  getPostSlugs,
  getPresignedS3URL,
  getUploadedFileKey,
  deleteFiles,
  deletePost,
  markdown,
};
