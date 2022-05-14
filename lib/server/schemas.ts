import { Schema } from "mongoose";
import { IPost, IUser } from "../../types";

export const UserSchema = new Schema<IUser>({
  avatar: Schema.Types.String,
  bio: Schema.Types.String,
  createdAt: Schema.Types.String,
  email: Schema.Types.String,
  password: Schema.Types.String,
  username: Schema.Types.String,
});

export const PostSchema = new Schema<IPost>({
  user: UserSchema,
  createdAt: Schema.Types.String,
  title: Schema.Types.String,
  slug: Schema.Types.String,
  body: Schema.Types.String,
  isPrivate: Schema.Types.Boolean,
  // comments: IComment[];
  // likes: ILike[];
});
