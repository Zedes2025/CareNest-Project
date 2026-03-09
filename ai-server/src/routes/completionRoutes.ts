import { Router } from 'express';
import { validateBody, authenticateOptional } from '#middleware';
import { promptSchema } from '#schemas';
import { createAiChat } from '#controllers';

const completionRoutes = Router();

completionRoutes.post('/chat', authenticateOptional, /*validateBody(promptSchema), */ createAiChat);

export default completionRoutes;
