import { Router } from 'express';
import { validateBody } from '#middleware';
import { promptSchema } from '#schemas';

const completionRoutes = Router();

export default completionRoutes;
