import { type RequestHandler } from "express";
import { z } from "zod";
import { msgContactInputSchema, msgContactSchema, getMsgSchema } from "#schemas";
import { msgContact } from "#models";

type msgInputDTO = Omit<z.infer<typeof msgContactInputSchema>, "createdAt">;
type msgDTO = z.infer<typeof msgContactSchema> | { message: string };

export const sendMessage: RequestHandler<{}, msgDTO, msgInputDTO> = async (req, res): Promise<void> => {
  try {
    // 1. Get sender ID from the authenticated user (NOT from req.body)
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { toUserId, msg } = req.body;
    const fromUserId = req.user.id;

    // 2. Validate using Zod (including the recipient)
    const validatedData = msgContactInputSchema.parse(req.body);

    const newMessage = new msgContact({
      fromUserId: fromUserId,
      toUserId: validatedData.toUserId,
      msg: validatedData.msg,
    });
    await newMessage.save();

    res.status(201).json({
      fromUserId: newMessage.fromUserId.toString(),
      toUserId: newMessage.toUserId.toString(),
      msg: newMessage.msg,
      createdAt: newMessage.createdAt,
      _id: newMessage._id,
    });
  } catch (error) {
    res.status(400).json({ message: "Validation failed" });
  }
};

export const getMessages: RequestHandler<{ id: string }, msgDTO[] | { message: string }> = async (req, res): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { id } = getMsgSchema.parse(req.params);
    const toUserId = id;
    const fromUserId = req.user.id;
    // We sort by createdAt: -1 to get the newest messages first
    const messages = await msgContact
      .find({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedMessages = messages.map((msg) => ({
      fromUserId: msg.fromUserId.toString(),
      toUserId: msg.toUserId.toString(),
      msg: msg.msg,
      createdAt: msg.createdAt,
      _id: msg._id,
    }));
    res.status(200).json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
