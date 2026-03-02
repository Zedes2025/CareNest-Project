import { Router } from 'express';
import { validateBody } from '#middleware';
import { promptSchema } from '#schemas';
import { createInMemoryChat } from '#controllers';
const completionRoutes = Router();

completionRoutes.post('/chat', validateBody(promptSchema), createInMemoryChat);

export default completionRoutes;
