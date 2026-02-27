import { Router } from 'express';
import { createInMemoryChat } from '#controllers';
import { validateBody } from '#middleware';
import { promptSchema } from '#schemas';

const completionRoutes = Router();

completionRoutes.post('/in-memory-chat', validateBody(promptSchema), createInMemoryChat);

export default completionRoutes;
