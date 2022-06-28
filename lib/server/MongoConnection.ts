import mongoose, { Connection, Schema, SchemaTypes } from "mongoose";
import { IPost, IUser } from "types";

const MONGODB_URI = process.env.MONGODB_URI;

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

export const MongoImageSchema = new Schema({
  name: SchemaTypes.String,
  img: {
    data: SchemaTypes.Buffer,
    contentType: SchemaTypes.String,
  },
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
});

MongoUserSchema.set("timestamps", true);
MongoPostSchema.set("timestamps", true);
MongoPostSchema.set("toObject", { getters: true, flattenMaps: true });

const MongoConnection = async () => {
  let mongoConnection: Connection;
  if (mongoose.connection?.readyState === 0 || 3) {
    await mongoose
      .connect(MONGODB_URI as string)
      .then((conn) => (mongoConnection = conn.connection))
      .catch(console.info);
  }

  const User = mongoose.models.User || mongoose.model("User", MongoUserSchema);
  const Post = mongoose.models.Post || mongoose.model("Post", MongoPostSchema);

  return { Post, User, mongoConnection };
};

export default MongoConnection;
