import AuthHttpService from "./AuthHttpService";
import CommonHttpService from "./CommonHttpService";
import { HomeTheme, avatarStyles } from "./MuiStyles";
import markdown from "./markdown";
import {
  deleteFiles,
  deletePost,
  getPostSlugs,
  getUploadedFileKey,
} from "./tasks";
import themes from "./themes";

const authHttpService = new AuthHttpService();
const commonHttpService = new CommonHttpService();

export {
  HomeTheme,
  authHttpService,
  avatarStyles,
  commonHttpService,
  deleteFiles,
  deletePost,
  getPostSlugs,
  getUploadedFileKey,
  markdown,
  themes,
};
