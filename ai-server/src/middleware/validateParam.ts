import type { RequestHandler } from 'express';
import { flattenError, z } from 'zod/v4';

const validateParam =
  (schema: any): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: z.flattenError(result.error).fieldErrors //gives  field-level mapping
      });
    }
    req.params = result.data;
    next();
  };

export default validateParam;
