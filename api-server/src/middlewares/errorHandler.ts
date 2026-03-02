import { type ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;

  if (
    err instanceof Error &&
    err.cause &&
    typeof err.cause === "object" &&
    "status" in err.cause
  ) {
    statusCode = (err.cause as any).status;
  }

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal server error",
  });
};

export default errorHandler;
