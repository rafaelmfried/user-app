import type { NextFunction, Request, Response } from "express";
import { env } from "../../../shared/config/env.js";
import { AppError, isAppError } from "../../../shared/errors/AppError.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const appError = normalizeError(err);
  const debugEnabled = env.debugErrors;
  const responseBody: Record<string, unknown> = {
    error: appError.code,
    message: appError.message,
  };

  if (debugEnabled) {
    if (appError.details) {
      responseBody.details = appError.details;
    }
    if (err instanceof Error) {
      responseBody.stack = err.stack;
    }
  }

  res.status(appError.statusCode).json(responseBody);
}

function normalizeError(err: unknown): AppError {
  if (isAppError(err)) {
    return err;
  }

  return new AppError({
    statusCode: 500,
    code: "INTERNAL_ERROR",
    message: "Unexpected error",
    cause: err,
  });
}
