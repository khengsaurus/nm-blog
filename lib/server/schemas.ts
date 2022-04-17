import { Schema } from "mongoose";
import { IUser } from "../../types";

export const UserSchema = new Schema<IUser>({
  avatar: Schema.Types.String,
  bio: Schema.Types.String,
  createdAt: Schema.Types.String,
  email: Schema.Types.String,
  password: Schema.Types.String,
  username: Schema.Types.String,
  cart: Schema.Types.Array,
});
