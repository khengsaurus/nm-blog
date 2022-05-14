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
  handleUserToken: (_?: string) => void;
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

interface IRef extends IHasId {
  type: string;
  ref: string;
}

interface IHasCreatedAt {
  createdAt: string;
}

interface IHasUserRef {
  user: IRef;
}

interface IHasBody {
  body: string;
}

export interface IRating {
  type: number;
  min: number;
  max: number;
}

export interface ILike extends IHasId, IHasCreatedAt, IHasUserRef {}

export interface IReview extends IHasId, IHasCreatedAt, IHasUserRef, IHasBody {
  rating: number;
  likes: ILike[];
}

export interface IItem extends IHasId, IHasUserRef {
  item_name: string;
  description: string;
  condition: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  price: number;
  status: string;
  reviews: IReview[];
  likes: ILike[];
}

export interface IComment extends IHasId, IHasCreatedAt, IHasUserRef, IHasBody {
  likes: ILike[];
}

export interface IPost extends IHasId, IHasCreatedAt, IHasUserRef {
  body: string;
  comments: IComment[];
  likes: ILike[];
}

export interface ICartItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface IUser extends IHasId {
  avatar: string;
  bio: string;
  createdAt: string;
  email: string;
  password: string;
  username: string;
  cart: ICartItem[];
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
  rating?: string;
}
