import { AppError, isAppError } from "../../../../src/shared/errors/AppError";

describe("AppError", () => {
  describe("constructor", () => {
    it("should create error with required fields", () => {
      const error = new AppError({
        message: "Test error",
        code: "TEST_ERROR",
      });

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.statusCode).toBe(500); // default
      expect(error.details).toBeUndefined();
      expect(error.name).toBe("AppError");
    });

    it("should use default statusCode 500 when not provided", () => {
      const error = new AppError({
        message: "No status",
        code: "NO_STATUS",
      });

      expect(error.statusCode).toBe(500);
    });

    it("should use provided statusCode when specified", () => {
      const error = new AppError({
        message: "Bad request",
        code: "BAD_REQUEST",
        statusCode: 400,
      });

      expect(error.statusCode).toBe(400);
    });

    it("should store details when provided", () => {
      const details = { field: "email", issue: "invalid" };
      const error = new AppError({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details,
      });

      expect(error.details).toEqual(details);
    });

    it("should store cause when provided", () => {
      const cause = new Error("Original error");
      const error = new AppError({
        message: "Wrapper error",
        code: "WRAPPER",
        cause,
      });

      expect(error.cause).toBe(cause);
    });

    it("should be instance of Error", () => {
      const error = new AppError({
        message: "Test",
        code: "TEST",
      });

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("isAppError", () => {
    it("should return true for AppError instances", () => {
      const error = new AppError({
        message: "App error",
        code: "APP_ERROR",
      });

      expect(isAppError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Regular error");

      expect(isAppError(error)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isAppError(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isAppError(undefined)).toBe(false);
    });

    it("should return false for plain objects", () => {
      const obj = { message: "Not an error", code: "FAKE" };

      expect(isAppError(obj)).toBe(false);
    });

    it("should return false for strings", () => {
      expect(isAppError("error string")).toBe(false);
    });
  });
});
