import type { RequestHandler } from 'express';

const validateParam =
  (schema: any): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.format()
      });
    }
    req.params = result.data;
    next();
  };

export default validateParam;
