import { Status } from "./enums";

export interface IAppContext {
  user: IUser;
  username: string;
  setUser: (_?: IUser) => void;
  setUsername: (_?: string) => void;
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

export interface IProduct extends IHasId, IHasUserRef {
  product_name: string;
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
  productId: string;
  quantity: number;
  price: number;
}

export interface IUser extends IHasId {
  avatar: string;
  bio: string;
  color: string;
  createdAt: string;
  email: string;
  password: string;
  username: string;
  cart: ICartItem[];
}

export interface IError {
  general?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  product_name?: string;
  price?: string;
  condition?: string;
  body?: string;
  rating?: string;
}
