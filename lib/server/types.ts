export interface HTTPFunctions {
  GET?: Function;
  POST?: Function;
  PUT?: Function;
  DELETE?: Function;
}

export interface User {
  _id?: number;
  avatar: string;
  bio: string;
  createdAt: string;
  email: string;
  password: string;
  username: string;
  cart: Array<any>;
}
