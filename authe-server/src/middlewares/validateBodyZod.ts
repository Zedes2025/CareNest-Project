import type { RequestHandler } from "express";
import { z, type ZodObject } from "zod/v4";

const validateBodyZod = (zodSchema: ZodObject): RequestHandler => {
  return (req, res, next) => {
    if (!req.body) return next(new Error("Request must have a body", { cause: { status: 400 } }));

    // const { data, error, success } = zodSchema.safeParse(req.body);
    const result = zodSchema.safeParse(req.body);

    if (!result.success) {
      // throw new Error(z.prettifyError(error), { cause: { status: 400 } });
      return next(new Error(z.prettifyError(result.error), { cause: { status: 400 } }));
    } else {
      req.body = result.data;
      next();
    }
  };
};

export default validateBodyZod;
