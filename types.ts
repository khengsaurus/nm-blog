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
  sessionActive: boolean;
  router: NextRouter;
  logout: () => void;
  setUser: (_?: IUser) => void;
  handleUserToken: (_: string, __: string) => void;
  setDarkMode: (_?: boolean) => void;
}

export interface IAlert {
  status: Status;
  message?: string;
}

interface IHasId {
  id?: string;
  _id?: string;
}

export interface IPost extends IHasId {
  user: IUser;
  userId: string;
  title: string;
  slug: string;
  body: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  // comments: IComment[];
  // likes: ILike[];
}

export interface IPostReq extends IPost {
  update: boolean;
  count?: number;
}

export interface IUser extends IHasId {
  id: string;
  avatar: string;
  bio: string;
  createdAt: string;
  email: string;
  password: string;
  username: string;
}

export interface IUserReq extends IUser {
  login: boolean;
  action: APIAction;
}

export interface IError {
  general?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  item_name?: string;
  price?: string;
  condition?: string;
  body?: string;
}
