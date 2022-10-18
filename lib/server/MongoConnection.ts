import { IS_DEV } from "consts";
import mongoose, { Connection, Schema, SchemaTypes } from "mongoose";
import { IPost, IUser } from "types";

export const MongoUserSchema = new Schema<IUser>({
  avatarKey: SchemaTypes.String,
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

export const MongoPostSchema = new Schema<IPost>({
  user: {
    type: SchemaTypes.ObjectId,
    ref: "User",
  },
  username: SchemaTypes.String,
  title: SchemaTypes.String,
  slug: SchemaTypes.String,
  body: SchemaTypes.String,
  isPrivate: SchemaTypes.Boolean,
  hasMarkdown: SchemaTypes.Boolean,
  imageKey: SchemaTypes.String,
  files: [
    {
      type: SchemaTypes.Map,
      key: SchemaTypes.String,
      name: SchemaTypes.String,
      uploaded: SchemaTypes.Number,
    },
  ],
});

MongoUserSchema.set("timestamps", true);
MongoPostSchema.set("timestamps", true);
MongoPostSchema.set("toObject", { getters: true, flattenMaps: true });

const MongoConnection = async () => {
  let mongoConnection: Connection;
  if (mongoose.connection?.readyState === 0 || 3) {
    await mongoose
      .connect(IS_DEV ? process.env.DEV_MONGODB_URI : process.env.MONGODB_URI)
      .then((conn) => (mongoConnection = conn.connection))
      .catch(console.error);
  }

  const User = mongoose.models.User || mongoose.model("User", MongoUserSchema);
  const Post = mongoose.models.Post || mongoose.model("Post", MongoPostSchema);

  return { mongoConnection, Post, User };
};

export default MongoConnection;
