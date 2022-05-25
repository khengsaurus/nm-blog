import { Schema, SchemaTypes } from "mongoose";
import { IPost, IUser } from "../../types";

export const UserSchema = new Schema<IUser>({
  avatar: SchemaTypes.String,
  bio: SchemaTypes.String,
  email: SchemaTypes.String,
  password: SchemaTypes.String,
  username: SchemaTypes.String,
  posts: [
    {
      type: SchemaTypes.ObjectId,
      ref: "Post",
    },
  ],
});

export const ImageSchema = new Schema({
  name: SchemaTypes.String,
  img: {
    data: SchemaTypes.Buffer,
    contentType: SchemaTypes.String,
  },
});

export const PostSchema = new Schema<IPost>({
  user: {
    type: SchemaTypes.ObjectId,
    ref: "User",
  },
  username: SchemaTypes.String,
  title: SchemaTypes.String,
  slug: SchemaTypes.String,
  body: SchemaTypes.String,
  isPrivate: SchemaTypes.Boolean,
  imageKey: SchemaTypes.String,
});

UserSchema.set("timestamps", true);
PostSchema.set("timestamps", true);
PostSchema.set("toObject", { getters: true, flattenMaps: true });
