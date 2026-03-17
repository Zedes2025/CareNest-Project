import { Router } from 'express';
import { validateBody, validateParam } from '#middleware';
import { authenticateRequired, authenticateOptional } from '#middleware';
import { promptSchema, docSchema, deleteDocSchema } from '#schemas';
import { createAiChat } from '#controllers';
import { createDoc, deleteDoc } from '#controllers';
const completionRoutes = Router();

completionRoutes.post('/chat', authenticateOptional, validateBody(promptSchema), createAiChat);
completionRoutes.post('/docs', authenticateRequired, validateBody(docSchema), createDoc);
completionRoutes.delete(
  '/docs/:id',
  authenticateRequired,
  validateParam(deleteDocSchema),
  deleteDoc
);
export default completionRoutes;
