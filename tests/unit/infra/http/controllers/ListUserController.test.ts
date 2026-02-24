import { jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ListUser } from "../../../../../src/application/user/ListUser";
import type { UserDTO } from "../../../../../src/application/user/UserDTO";
import { ListUserController } from "../../../../../src/infra/http/controllers/ListUserController";
import {
  createMockNext,
  createMockRequest,
  createMockResponse,
  type MockResponse,
} from "../../../../setup/testTypes";

describe("ListUserController", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockListUser: { execute: jest.Mock<any> };
  let controller: ListUserController;
  let mockRequest: Partial<Request>;
  let mockResponse: MockResponse;
  let mockNext: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockListUser = {
      execute: jest.fn<any>(),
    };

    controller = new ListUserController(mockListUser as unknown as ListUser);

    const mocks = createMockResponse();
    mockResponse = mocks.res;
    statusMock = mocks.statusMock;
    jsonMock = mocks.jsonMock;
    mockRequest = createMockRequest();
    mockNext = createMockNext();
  });

  describe("handle", () => {
    it("should return 200 with empty array when no users", async () => {
      mockListUser.execute.mockResolvedValue([]);

      await controller.handle(
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(mockListUser.execute).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 200 with users array on success", async () => {
      const users: UserDTO[] = [
        { id: 1, name: "John", email: "john@test.com", createdAt: new Date() },
        { id: 2, name: "Jane", email: "jane@test.com", createdAt: new Date() },
      ];
      mockListUser.execute.mockResolvedValue(users);

      await controller.handle(
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(mockListUser.execute).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(users);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error when listUser.execute throws", async () => {
      const error = new Error("Database connection failed");
      mockListUser.execute.mockRejectedValue(error);

      await controller.handle(
        mockRequest as Request,
        mockResponse as unknown as Response,
        mockNext,
      );

      expect(mockListUser.execute).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
