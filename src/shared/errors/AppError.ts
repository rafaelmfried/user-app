export type AppErrorDetails = Record<string, unknown>;

export type AppErrorOptions = {
  message: string;
  code: string;
  statusCode?: number;
  details?: AppErrorDetails;
  cause?: unknown;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: AppErrorDetails | undefined;

  constructor({
    message,
    code,
    statusCode = 500,
    details,
    cause,
  }: AppErrorOptions) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
