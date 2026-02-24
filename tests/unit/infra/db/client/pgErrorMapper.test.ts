import { mapPgError } from "../../../../../src/infra/db/client/pgErrorMapper";
import { AppError } from "../../../../../src/shared/errors/AppError";

describe("mapPgError", () => {
  describe("PostgreSQL error codes - table-driven tests", () => {
    const pgErrorCases = [
      {
        code: "23505",
        description: "unique violation",
        expected: {
          statusCode: 409,
          code: "DB_UNIQUE_VIOLATION",
          message: "Resource already exists",
        },
      },
      {
        code: "23503",
        description: "foreign key violation",
        expected: {
          statusCode: 409,
          code: "DB_FOREIGN_KEY_VIOLATION",
          message: "Invalid reference",
        },
      },
      {
        code: "23502",
        description: "not null violation",
        expected: {
          statusCode: 400,
          code: "DB_NOT_NULL_VIOLATION",
          message: "Missing required field",
        },
      },
      {
        code: "22P02",
        description: "invalid text representation",
        expected: {
          statusCode: 400,
          code: "DB_INVALID_TEXT",
          message: "Invalid input format",
        },
      },
      {
        code: "22001",
        description: "string truncation",
        expected: {
          statusCode: 400,
          code: "DB_STRING_TRUNCATION",
          message: "Value too long",
        },
      },
      {
        code: "40001",
        description: "serialization failure",
        expected: {
          statusCode: 503,
          code: "DB_SERIALIZATION_FAILURE",
          message: "Database is busy, retry later",
        },
      },
      {
        code: "99999",
        description: "unknown pg error code (valid 5-char format)",
        expected: {
          statusCode: 500,
          code: "DB_ERROR",
          message: "Database error",
        },
      },
    ];

    it.each(pgErrorCases)(
      "should map $description (code: $code) to AppError",
      ({ code, expected }) => {
        const pgError = {
          code,
          detail: "Some detail",
          constraint: "some_constraint",
          table: "users",
          column: "email",
          schema: "public",
        };

        const result = mapPgError(pgError);

        expect(result).toBeInstanceOf(AppError);
        expect(result?.statusCode).toBe(expected.statusCode);
        expect(result?.code).toBe(expected.code);
        expect(result?.message).toBe(expected.message);
      }
    );

    it.each(pgErrorCases)(
      "should include details for $description",
      ({ code }) => {
        const pgError = {
          code,
          detail: "Error detail",
          constraint: "unique_email",
          table: "users",
          column: "email",
          schema: "public",
        };

        const result = mapPgError(pgError);

        expect(result?.details).toEqual({
          code,
          detail: "Error detail",
          constraint: "unique_email",
          table: "users",
          column: "email",
          schema: "public",
        });
      }
    );

    it.each(pgErrorCases)(
      "should include original error as cause for $description",
      ({ code }) => {
        const pgError = { code };

        const result = mapPgError(pgError);

        expect(result?.cause).toBe(pgError);
      }
    );
  });

  describe("connection errors - table-driven tests", () => {
    const connectionErrorCases = [
      {
        code: "ECONNREFUSED",
        description: "connection refused",
      },
      {
        code: "ENOTFOUND",
        description: "host not found",
      },
      {
        code: "ETIMEDOUT",
        description: "connection timed out",
      },
    ];

    it.each(connectionErrorCases)(
      "should map $description to DB_UNAVAILABLE",
      ({ code }) => {
        const error = { code };

        const result = mapPgError(error);

        expect(result).toBeInstanceOf(AppError);
        expect(result?.statusCode).toBe(503);
        expect(result?.code).toBe("DB_UNAVAILABLE");
        expect(result?.message).toBe("Database unavailable");
      }
    );
  });

  describe("non-mappable errors", () => {
    const nonMappableErrors = [
      { value: null, description: "null" },
      { value: undefined, description: "undefined" },
      { value: "string error", description: "string" },
      { value: 12345, description: "number" },
      { value: {}, description: "empty object" },
      { value: { message: "error" }, description: "object without code" },
      { value: { code: "" }, description: "object with empty code" },
      { value: { code: "AB" }, description: "object with short code (2 chars)" },
      { value: { code: "ABCDEF" }, description: "object with long code (6 chars)" },
    ];

    it.each(nonMappableErrors)(
      "should return null for $description",
      ({ value }) => {
        const result = mapPgError(value);
        expect(result).toBeNull();
      }
    );
  });

  describe("edge cases", () => {
    it("should handle error with minimal fields", () => {
      const result = mapPgError({ code: "23505" });

      expect(result).toBeInstanceOf(AppError);
      expect(result?.details).toEqual({
        code: "23505",
        detail: undefined,
        constraint: undefined,
        table: undefined,
        column: undefined,
        schema: undefined,
      });
    });

    it("should handle lowercase pg error codes as unknown (switch is case-sensitive)", () => {
      // Note: The regex accepts lowercase, but the switch cases are uppercase
      // So lowercase codes like "22p02" won't match "22P02" and fall to default
      const result = mapPgError({ code: "22p02" });

      expect(result).toBeInstanceOf(AppError);
      expect(result?.code).toBe("DB_ERROR"); // Falls to default case
    });

    it("should handle valid 5-char alphanumeric codes as pg errors", () => {
      const result = mapPgError({ code: "ABCDE" });

      expect(result).toBeInstanceOf(AppError);
      expect(result?.code).toBe("DB_ERROR");
    });
  });
});
