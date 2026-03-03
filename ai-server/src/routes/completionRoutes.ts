import { Router } from 'express';
import { validateBody } from '#middleware';
import { promptSchema } from '#schemas';
import { createAiChat } from '#controllers';
const completionRoutes = Router();

completionRoutes.post('/chat', /*validateBody(promptSchema), */ createAiChat);

export default completionRoutes;
