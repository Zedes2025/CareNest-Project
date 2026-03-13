import { z } from "zod";
import { isValidObjectId, Types } from "mongoose";

export const msgContactInputSchema = z.strictObject({
  fromUserId: z.string().refine((val) => isValidObjectId(val), "Invalid User ID"),
  toUserId: z.string().refine((val) => isValidObjectId(val), "Invalid User ID"),
  createdAt: z.date(),
  message: z.string().min(10, "Please enter a valid message").max(256, "U have reached max amount of characters. Please summarize it in short."),
});

export const msgContactSchema = z.strictObject({
  _id: z.instanceof(Types.ObjectId),
  ...msgContactInputSchema.shape,
});
