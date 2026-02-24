import { jest } from "@jest/globals";
import type { Request, Response } from "express";
import { HealthCheckController } from "../../../../../src/infra/http/controllers/HealthCheckController";
import type { HealthCheck } from "../../../../../src/infra/http/health/HealthCheck";
import {
  createMockNext,
  createMockRequest,
  createMockResponse,
  type MockResponse,
} from "../../../../setup/testTypes";

describe("HealthCheckController", () => {
  let mockHealthCheck: { check: jest.Mock };
  let controller: HealthCheckController;
  let mockRequest: Partial<Request>;
  let mockResponse: MockResponse;
  let mockNext: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockHealthCheck = {
      check: jest.fn(),
    };

    controller = new HealthCheckController(
      mockHealthCheck as unknown as HealthCheck,
    );

    const mocks = createMockResponse();
    mockResponse = mocks.res;
    statusMock = mocks.statusMock;
    jsonMock = mocks.jsonMock;
    mockRequest = createMockRequest();
    mockNext = createMockNext();
  });

  describe("handle", () => {
    it("should return 200 with health status on success", async () => {
      const healthStatus = {
        status: "healthy",
        timestamp: "2024-01-01T00:00:00Z",
      };
      mockHealthCheck.check.mockReturnValue(healthStatus);

      await controller.handle(
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(mockHealthCheck.check).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(healthStatus);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error when healthCheck.check throws", async () => {
      const error = new Error("Health check failed");
      mockHealthCheck.check.mockImplementation(() => {
        throw error;
      });

      await controller.handle(
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(mockHealthCheck.check).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
