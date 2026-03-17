import type { RequestHandler } from 'express';
import type { ZodObject } from 'zod/v4';
import { flattenError, z } from 'zod/v4';

const validateBody =
  (zodSchema: ZodObject): RequestHandler =>
  (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is missing.' });
    }

    const result = zodSchema.safeParse(req.body);

    if (!result.success) {
      // send structured JSON
      return res.status(400).json({
        message: 'Validation failed',
        errors: z.flattenError(result.error).fieldErrors //gives  field-level mapping
      });
    }

    req.body = result.data;
    next();
  };

export default validateBody;
