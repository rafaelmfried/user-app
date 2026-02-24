import { AppError } from "../../../shared/errors/index.js";

type PgErrorLike = {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
  schema?: string;
  message?: string;
};

const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_NOT_NULL_VIOLATION = "23502";
const PG_INVALID_TEXT = "22P02";
const PG_STRING_TRUNCATION = "22001";
const PG_SERIALIZATION_FAILURE = "40001";

export function mapPgError(err: unknown): AppError | null {
  if (!isPgErrorLike(err)) {
    return mapConnectionError(err);
  }

  switch (err.code) {
    case PG_UNIQUE_VIOLATION:
      return new AppError({
        statusCode: 409,
        code: "DB_UNIQUE_VIOLATION",
        message: "Resource already exists",
        details: pickDetails(err),
        cause: err,
      });
    case PG_FOREIGN_KEY_VIOLATION:
      return new AppError({
        statusCode: 409,
        code: "DB_FOREIGN_KEY_VIOLATION",
        message: "Invalid reference",
        details: pickDetails(err),
        cause: err,
      });
    case PG_NOT_NULL_VIOLATION:
      return new AppError({
        statusCode: 400,
        code: "DB_NOT_NULL_VIOLATION",
        message: "Missing required field",
        details: pickDetails(err),
        cause: err,
      });
    case PG_INVALID_TEXT:
      return new AppError({
        statusCode: 400,
        code: "DB_INVALID_TEXT",
        message: "Invalid input format",
        details: pickDetails(err),
        cause: err,
      });
    case PG_STRING_TRUNCATION:
      return new AppError({
        statusCode: 400,
        code: "DB_STRING_TRUNCATION",
        message: "Value too long",
        details: pickDetails(err),
        cause: err,
      });
    case PG_SERIALIZATION_FAILURE:
      return new AppError({
        statusCode: 503,
        code: "DB_SERIALIZATION_FAILURE",
        message: "Database is busy, retry later",
        details: pickDetails(err),
        cause: err,
      });
    default:
      return new AppError({
        statusCode: 500,
        code: "DB_ERROR",
        message: "Database error",
        details: pickDetails(err),
        cause: err,
      });
  }
}

function isPgErrorLike(err: unknown): err is PgErrorLike {
  if (typeof err !== "object" || err === null || !("code" in err)) {
    return false;
  }
  const code = String((err as { code?: string }).code ?? "");
  return /^[0-9A-Z]{5}$/i.test(code);
}

function pickDetails(err: PgErrorLike): Record<string, unknown> {
  return {
    code: err.code,
    detail: err.detail,
    constraint: err.constraint,
    table: err.table,
    column: err.column,
    schema: err.schema,
  };
}

function mapConnectionError(err: unknown): AppError | null {
  if (typeof err !== "object" || err === null || !("code" in err)) {
    return null;
  }

  const code = String((err as { code?: string }).code ?? "");
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
    return new AppError({
      statusCode: 503,
      code: "DB_UNAVAILABLE",
      message: "Database unavailable",
      cause: err,
    });
  }

  return null;
}
