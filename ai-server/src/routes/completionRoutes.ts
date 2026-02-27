import { Router } from 'express';
import { validateBody } from '#middleware';
import { promptSchema } from '#schemas';

const completionRoutes = Router();

completionRoutes.post('/in-memory-chat', validateBody(promptSchema));

export default completionRoutes;
