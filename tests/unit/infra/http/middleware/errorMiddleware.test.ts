import { jest } from "@jest/globals";
import type { Request, Response } from "express";
import { errorMiddleware } from "../../../../../src/infra/http/middleware/errorMiddleware";
import { AppError } from "../../../../../src/shared/errors/AppError";
import {
  createMockNext,
  createMockRequest,
  createMockResponse,
  type MockResponse,
} from "../../../../setup/testTypes";

// Mock the env module
jest.unstable_mockModule("../../../../../src/shared/config/index.js", () => ({
  env: {
    debugErrors: false,
  },
}));

describe("errorMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: MockResponse;
  let mockNext: jest.Mock;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    const mocks = createMockResponse();
    mockResponse = mocks.res;
    statusMock = mocks.statusMock;
    jsonMock = mocks.jsonMock;
    mockRequest = createMockRequest();
    mockNext = createMockNext();
  });

  describe("when error is AppError", () => {
    it("should respond with AppError status code and message", () => {
      const appError = new AppError({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      });

      errorMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "VALIDATION_ERROR",
        message: "Invalid input",
      });
    });

    it("should handle different status codes", () => {
      const appError = new AppError({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Resource not found",
      });

      errorMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "NOT_FOUND",
        message: "Resource not found",
      });
    });

    it("should handle 500 errors", () => {
      const appError = new AppError({
        statusCode: 500,
        code: "DB_ERROR",
        message: "Database connection failed",
      });

      errorMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "DB_ERROR",
        message: "Database connection failed",
      });
    });
  });

  describe("when error is not AppError", () => {
    it("should normalize generic Error to 500 INTERNAL_ERROR", () => {
      const genericError = new Error("Something went wrong");

      errorMiddleware(
        genericError,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "INTERNAL_ERROR",
        message: "Unexpected error",
      });
    });

    it("should normalize string error to 500 INTERNAL_ERROR", () => {
      errorMiddleware(
        "string error",
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "INTERNAL_ERROR",
        message: "Unexpected error",
      });
    });

    it("should normalize null error to 500 INTERNAL_ERROR", () => {
      errorMiddleware(
        null,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "INTERNAL_ERROR",
        message: "Unexpected error",
      });
    });

    it("should normalize undefined error to 500 INTERNAL_ERROR", () => {
      errorMiddleware(
        undefined,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "INTERNAL_ERROR",
        message: "Unexpected error",
      });
    });

    it("should normalize object error to 500 INTERNAL_ERROR", () => {
      errorMiddleware(
        { some: "object" },
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "INTERNAL_ERROR",
        message: "Unexpected error",
      });
    });
  });
});
