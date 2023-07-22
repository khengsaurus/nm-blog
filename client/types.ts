import { NextRouter } from "next/router";
import { ApiAction, FileStatus, Status } from "./enums";

export type AlertStatus = "success" | "info" | "warning" | "error";

/*------------------------------ API ------------------------------*/

export interface IResponse<T = any> {
  status?: number;
  message?: string;
  data?: T;
}

/*------------------------------ . ------------------------------*/

export interface IAppContext {
  pageReady: boolean;
  user: IUser;
  userToken: string;
  userSessionActive: boolean;
  router: NextRouter;
  history: string[];
  theme: ITheme;
  setPageReady: (pageReady?: boolean) => void;
  handleUser: (token: string, user: IUser) => void;
  logout: (backToLogin?: boolean) => void;
  routerPush: (route: string) => void;
  routerBack: () => void;
  setThemeName: (theme?: string) => void;
  updatePostSlugs: (user: IUser) => void;
}

export interface ITheme {
  name: string;
  background: string;
  primary: string;
  secondary: string;
  highlightColor: string;
  mainText: string;
  mainTextDisabled: string;
  icon: string;
}

export interface IThemeOptions {
  [key: string]: ITheme;
}

export interface IAlert {
  status: Status;
  message?: string;
}

interface IRequest {
  userId?: string;
  action?: ApiAction;
}

interface IHasId {
  id: string;
  _id?: string;
}

interface IHasTimestamps {
  createdAt: string;
  updatedAt: string;
}

interface IHasImage {
  imageKey: string;
}

export interface IPostFile {
  uploaded: number;
  // only exists on uploaded files
  name?: string;
  key?: string;
  // only exists on un/newly-uploaded files
  status?: FileStatus;
  file?: File;
}

export interface IPost
  extends Partial<IHasId>,
    Partial<IHasImage>,
    Partial<IHasTimestamps> {
  slug?: string;
  username?: string;
  user?: IUser;
  title?: string;
  body?: string;
  files?: IPostFile[];
  isPrivate?: boolean;
  hasMarkdown?: boolean;
}

export interface IPostReq extends IPost, IRequest {
  update: boolean;
  limit?: number;
  sort?: 1 | -1;
  cursor?: string;
  fresh?: boolean;
  search?: string;
}

export interface IUser extends IHasId, Partial<IHasTimestamps> {
  id: string;
  avatarKey: string;
  bio: string;
  email: string;
  password: string;
  username: string;
  posts: IPost[];
  isAdmin: boolean;
}

export interface IUserReq extends IUser, IRequest {
  login: boolean;
  token?: string;
}

export interface IFileReq extends IRequest {
  key?: string;
  keys?: string;
}
