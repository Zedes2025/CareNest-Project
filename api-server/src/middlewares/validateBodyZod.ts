import type { RequestHandler } from "express";
import { z, type ZodObject, type ZodRawShape } from "zod/v4";

const validateBody = (zodSchema: ZodObject<ZodRawShape>): RequestHandler => {
  return (req, res, next) => {
    if (!req.body)
      next(new Error("Request must have a body", { cause: { status: 400 } }));

    const { data, error, success } = zodSchema.safeParse(req.body);

    if (!success) {
      // throw new Error(z.prettifyError(error), { cause: { status: 400 } });
      next(new Error(z.prettifyError(error), { cause: { status: 400 } }));
    } else {
      req.body = data;
      next();
    }
  };
};

export default validateBody;
