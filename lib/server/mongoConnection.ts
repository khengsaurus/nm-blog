import mongoose from "mongoose";
import { UserSchema } from "./schemas";

const MONGODB_URI = process.env.MONGODB_URI;

export const mongoConnection = async () => {
  let conn;
  if (mongoose.connection.readyState === 0 || 3) {
    conn = await mongoose
      .connect(MONGODB_URI as string)
      .catch((err) => console.log(err));
  }

  const User = mongoose.models.User || mongoose.model("User", UserSchema); // prevent OverwriteModelError

  return { conn, User };
};
