import { NextRouter } from "next/router";
import { APIAction, Status } from "./enums";

export type AlertStatus = "success" | "info" | "warning" | "error";

/*------------------------------ API ------------------------------*/

export interface IResponse {
  status?: number;
  message?: string;
  data?: any;
}

/*------------------------------ . ------------------------------*/

export interface IAppContext {
  user: IUser;
  userToken: string;
  darkMode: boolean;
  history: string[];
  router: NextRouter;
  userSessionActive: boolean;
  routerPush: (route: string) => void;
  routerBack: () => void;
  logout: () => void;
  updatePostSlugs: (user: IUser) => void;
  handleUser: (token: string, user: IUser) => void;
  setDarkMode: (_?: boolean) => void;
}

export interface IAlert {
  status: Status;
  message?: string;
}

interface IRequest {
  userId: string;
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
  imageName: string;
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
  isPrivate?: boolean;
  hasMarkdown?: boolean;
}

export interface IPostReq extends IPost, IRequest {
  update: boolean;
  limit?: number;
  sort?: 1 | -1;
  cursor?: string;
}

export interface IUser extends IHasId, Partial<IHasTimestamps> {
  id: string;
  avatar: string;
  bio: string;
  email: string;
  password: string;
  username: string;
  posts: IPost[];
}

export interface IUserReq extends IUser, IRequest {
  login: boolean;
  action: APIAction;
}
