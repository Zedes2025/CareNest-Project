import { z } from "zod";
import { isValidObjectId } from "mongoose";

const validObjectId = z
  .string()
  .refine((val) => isValidObjectId(val), { message: "Invalid userId" });

const messageSchema = z.object({
  role: z.enum(["assistant", "system", "user", "developer"]),
  content: z.string().min(1, "Message content is required"),
});

export const chatCreateSchema = z.object({
  userId: validObjectId, // :z.string().refine((val) => isValidObjectId(val),"Invalid userId"),
  messages: z.array(messageSchema).default([]),
});
