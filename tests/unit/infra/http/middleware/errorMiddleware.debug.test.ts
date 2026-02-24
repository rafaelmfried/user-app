import { jest } from "@jest/globals";
import type { Request, Response } from "express";
import { AppError } from "../../../../../src/shared/errors/AppError";
import {
  createMockNext,
  createMockRequest,
  createMockResponse,
  type MockResponse,
} from "../../../../setup/testTypes";

// Mock the env module with debug enabled
jest.unstable_mockModule("../../../../../src/shared/config/index.js", () => ({
  env: {
    debugErrors: true,
  },
}));

// Import after mocking
const { errorMiddleware } =
  await import("../../../../../src/infra/http/middleware/errorMiddleware");

describe("errorMiddleware - debug mode", () => {
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

  describe("when debug is enabled", () => {
    it("should include details when AppError has details", () => {
      const appError = new AppError({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: { field: "email", reason: "Invalid format" },
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
        details: { field: "email", reason: "Invalid format" },
        stack: expect.any(String),
      });
    });

    it("should include stack trace for Error objects", () => {
      const genericError = new Error("Something went wrong");

      errorMiddleware(
        genericError,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.stringContaining("Error: Something went wrong"),
        }),
      );
    });

    it("should not include stack for non-Error objects", () => {
      errorMiddleware(
        "string error",
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      const calledWith = jsonMock.mock.calls[0][0] as Record<string, unknown>;
      expect(calledWith.stack).toBeUndefined();
    });

    it("should not include details when AppError has no details", () => {
      const appError = new AppError({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Not found",
      });

      errorMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      const calledWith = jsonMock.mock.calls[0][0] as Record<string, unknown>;
      expect(calledWith.details).toBeUndefined();
      expect(calledWith.stack).toBeDefined();
    });
  });
});
