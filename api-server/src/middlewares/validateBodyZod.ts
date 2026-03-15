import type { RequestHandler } from "express";
import { z, type ZodObject, type ZodRawShape } from "zod/v4";

const validateBody = (zodSchema: ZodObject<ZodRawShape>): RequestHandler => {
  return (req, res, next) => {
    // 1. Check if body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request must have a body" });
    }

    // 2. Parse the body
    const result = zodSchema.safeParse(req.body);

    if (!result.success) {
      // 3. Send the Zod errors back immediately as JSON
      // result.error.flatten() gives a cleaner format than prettifyError for APIs
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    // 4. If successful, update body and move to controller
    req.body = result.data;
    next();
  };
};

export default validateBody;
