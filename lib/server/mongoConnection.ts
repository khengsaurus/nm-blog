import mongoose from "mongoose";
import { PostSchema, UserSchema } from "./schemas";

const MONGODB_URI = process.env.MONGODB_URI;

const mongoConnection = async () => {
  let connection;
  if (mongoose.connection?.readyState === 0 || 3) {
    connection = await mongoose
      .connect(MONGODB_URI as string)
      .catch((err) => console.error(err));
  }

  const User = mongoose.models.User || mongoose.model("User", UserSchema); // prevent OverwriteModelError
  const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

  return { Post, User };
};

export default mongoConnection;
