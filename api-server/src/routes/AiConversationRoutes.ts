import { Router } from "express";
import { validateBody } from "#middlewares";
import { z } from "zod";

import { getAiChats, getAiChatById, createAiChat } from "#controllers";

import { chatCreateSchema } from "#schemas";
import userRoutes from "./UserRoutes";
import { create } from "domain";

const aiChatRoutes = Router();
aiChatRoutes
  .route("/")
  .get(getAiChats)
  .post(validateBody(chatCreateSchema), createAiChat);

aiChatRoutes.route("/:id").get(getAiChatById);

export default aiChatRoutes;
