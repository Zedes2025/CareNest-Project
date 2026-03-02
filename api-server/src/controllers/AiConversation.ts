import { type AIConversationType } from "#types";
import { aiChat } from "#models";
import { type RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const getAiChats: RequestHandler = async (req, res) => {
  const chats = await aiChat.find();
  res.json(chats);
};

export const getAiChatById: RequestHandler = async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!isValidObjectId(id))
    throw new Error("Invalid id", { cause: { status: 400 } });
  const chat = await aiChat.findById(id).lean();
  if (!chat) throw new Error("Chat not found", { cause: { status: 404 } });
  res.json(chat);
};
export const createAiChat: RequestHandler = async (req, res) => {};
