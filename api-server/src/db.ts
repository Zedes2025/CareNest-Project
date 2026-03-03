import mongoose from "mongoose";

try {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  });
  console.log("MongoDB connected");
} catch (error) {
  console.error("MongoDB connection error:", error);
  process.exit(1);
}
