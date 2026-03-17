import { z } from "zod";
import { isValidObjectId, Types } from "mongoose";

export const msgContactInputSchema = z.strictObject({
  toUserId: z.string().refine((val) => isValidObjectId(val), "Invalid User ID"),
  msg: z.string().min(1, "Please enter a valid message").max(256, "U have reached max amount of characters. Please summarize it in short."),
});

export const msgContactSchema = z.strictObject({
  _id: z.instanceof(Types.ObjectId),
  fromUserId: z.string(),
  createdAt: z.date().default,
  ...msgContactInputSchema.shape,
});

export const getMsgSchema = z.strictObject({
  id: z.string().refine((val) => isValidObjectId(val), "Invalid User ID"),
});
