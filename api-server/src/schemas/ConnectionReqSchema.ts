import { z } from "zod";
import { isValidObjectId, Types } from "mongoose";

export const connectionReqInputSchema = z.strictObject({
  fromUserId: z.string().refine((val) => isValidObjectId(val), "Invalid User ID"),
  toUserId: z.string().refine((val) => isValidObjectId(val), "Invalid User ID"),
  // message: z.string().min(10, "Please enter a valid message").max(256, "U have reached max amount of characters. Please summarize it in short."),
  // profilePicture: z.string(),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending").optional(),
});

export const connectionReqSchema = z.strictObject({
  _id: z.instanceof(Types.ObjectId),
  ...connectionReqInputSchema.shape,
});
