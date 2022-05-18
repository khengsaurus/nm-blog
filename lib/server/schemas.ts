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

export const ImageSchema = new Schema({
  name: Schema.Types.String,
  img: {
    data: Schema.Types.Buffer,
    contentType: Schema.Types.String,
  },
});

export const PostSchema = new Schema<IPost>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: "Image",
  },
  username: Schema.Types.String,
  title: Schema.Types.String,
  slug: Schema.Types.String,
  body: Schema.Types.String,
  isPrivate: Schema.Types.Boolean,
  createdAt: Schema.Types.String,
  updatedAt: Schema.Types.String,
});

PostSchema.set("toObject", { getters: true, flattenMaps: true });
