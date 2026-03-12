import { Router } from 'express';
import { validateBody, authenticateOptional } from '#middleware';
import { authenticateRequired } from '#middleware';
import { promptSchema } from '#schemas';
import { createAiChat } from '#controllers';
import { createDoc } from '#controllers';
const completionRoutes = Router();

completionRoutes.post('/chat', authenticateOptional, /*validateBody(promptSchema), */ createAiChat);
completionRoutes.post('/docs', authenticateRequired, /*validateBody(docSchema), */ createDoc);

export default completionRoutes;
