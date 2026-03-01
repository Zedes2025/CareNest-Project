import { Router } from "express";
import { validateBody } from "#middlewares";
import { z } from "zod";

import { getChats, getChatById, createChat } from "#controllers";

import { chatCreateSchema } from "#schemas";
import userRoutes from "./UserRoutes";
import { create } from "domain";

const aiChatRoutes = Router();
aiChatRoutes
  .route("/")
  .get(getChats)
  .post(validateBody(chatCreateSchema), createChat);

aiChatRoutes.route("/:id").get(getChatById);

export default aiChatRoutes;
