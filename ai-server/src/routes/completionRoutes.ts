import { Router } from 'express';
import { validateBody, authenticateOptional } from '#middleware';
import { authenticateRequired } from '#middleware';
import { promptSchema, docSchema } from '#schemas';
import { createAiChat } from '#controllers';
import { createDoc, deleteDoc } from '#controllers';
const completionRoutes = Router();

completionRoutes.post('/chat', authenticateOptional, validateBody(promptSchema), createAiChat);
completionRoutes.post('/docs', authenticateRequired, validateBody(docSchema), createDoc);
completionRoutes.delete('/docs/:id', authenticateRequired, /*validateBody(docSchema), */ deleteDoc);
export default completionRoutes;
