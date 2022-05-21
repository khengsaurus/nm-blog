import mongoose, { Connection } from "mongoose";
import { PostSchema, UserSchema } from "./schemas";

const MONGODB_URI = process.env.MONGODB_URI;

const mongoConnection = async () => {
  let MongoConnection: Connection;
  if (mongoose.connection?.readyState === 0 || 3) {
    await mongoose
      .connect(MONGODB_URI as string)
      .then((conn) => (MongoConnection = conn.connection))
      .catch((err) => console.error(err));
  }

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

  return { Post, User, MongoConnection };
};

export default mongoConnection;
