import { type RequestHandler } from "express";
import { z } from "zod";
import { msgContactInputSchema, msgContactSchema } from "#schemas";
import { msgContact } from "#models";

type msgInputDTO = z.infer<typeof msgContactInputSchema>;
type msgDTO = z.infer<typeof msgContactSchema>;

export const sendMessage: RequestHandler<{}, msgDTO | { message: string }, msgInputDTO> = async (req, res): Promise<void> => {
  try {
    // 1. Get sender ID from the authenticated user (NOT from req.body)
    if (!req.user || !req.user.id) {
    throw new Error("Unauthorized", { cause: { status: 401 } });
    }

    const { toUserId, message } = req.body;
    const fromUserId = req.user.id;

   // 2. Validate using Zod (including the recipient)
    const validatedData = msgContactInputSchema.parse({
      fromUserId,
      toUserId,
      message
        });

      const newMessage = new msgContact({
      fromUserId: validatedData.fromUserId,
      toUserId: validatedData.toUserId,
      msg: validatedData.message,
          });
    await newMessage.save();

    res.status(201).json({
      fromUserId: newMessage.fromUserId.toString(),
      toUserId: newMessage.toUserId.toString(),
      message: newMessage.msg,
       createdAt: newMessage.createdAt,
      _id: newMessage._id
    });
  } catch (error) {
    res.status(400).json({ message: "Validation failed" });
  }
};

export const getMessages: RequestHandler<>= async (req, res):Promise<void> => {
  try {
    const { fromUserId, toUserId } = req.params;

    // We sort by createdAt: -1 to get the newest messages first
    const messages = await msgContact
      .find({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
