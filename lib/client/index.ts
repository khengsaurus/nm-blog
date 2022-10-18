import ClientHTTPService from "./ClientHttpService";
import markdown from "./markdown";
import {
  getPostSlugs,
  getPresignedS3URL,
  getUploadedFileKey,
  deleteFiles,
  deletePost,
} from "./tasks";
import themes from "./themes";
import { avatarStyles, HomeTheme } from "./MuiStyles";

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
