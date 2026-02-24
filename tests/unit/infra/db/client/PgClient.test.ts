import { jest } from "@jest/globals";
import type pg from "pg";
import { PgClient } from "../../../../../src/infra/db/client/PgClient";
import { AppError } from "../../../../../src/shared/errors/AppError";
import { createMockPool, type MockPool } from "../../../../setup/testTypes";

describe("PgClient", () => {
  let mockPool: MockPool;
  let pgClient: PgClient;

  beforeEach(() => {
    mockPool = createMockPool();
    pgClient = new PgClient(mockPool as unknown as pg.Pool);

    // Suppress console output during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  describe("query", () => {
    it("should execute query and return result", async () => {
      const expectedResult = { rows: [{ id: 1, name: "test" }], rowCount: 1 };
      mockPool.query.mockResolvedValue(expectedResult );

      const result = await pgClient.query("SELECT * FROM users");

      expect(mockPool.query).toHaveBeenCalledWith("SELECT * FROM users", []);
      expect(result).toEqual(expectedResult);
    });

    it("should pass parameters to query", async () => {
      const expectedResult = { rows: [], rowCount: 0 };
      mockPool.query.mockResolvedValue(expectedResult );

      await pgClient.query("SELECT * FROM users WHERE id = $1", [42]);

      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        [42],
      );
    });

    it("should throw mapped AppError for pg errors", async () => {
      const pgError = { code: "23505", detail: "duplicate key" };
      mockPool.query.mockRejectedValue(pgError);

      await expect(pgClient.query("INSERT INTO users")).rejects.toThrow(
        AppError,
      );
      await expect(pgClient.query("INSERT INTO users")).rejects.toMatchObject({
        code: "DB_UNIQUE_VIOLATION",
      });
    });

    it("should throw original error for non-mappable errors", async () => {
      const genericError = new Error("Unknown error");
      mockPool.query.mockRejectedValue(genericError);

      await expect(pgClient.query("SELECT 1")).rejects.toThrow(genericError);
    });

    it("should log error on failure", async () => {
      const pgError = { code: "23505" };
      mockPool.query.mockRejectedValue(pgError);

      await expect(pgClient.query("INSERT INTO users")).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("connect", () => {
    it("should connect and release client", async () => {
      const mockClient = { release: jest.fn() };
      mockPool.connect.mockResolvedValue(mockClient);

      await pgClient.connect();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
      expect(console.debug).toHaveBeenCalledWith(
        "Database connection established",
      );
    });

    it("should throw mapped AppError for connection errors", async () => {
      const connectionError = { code: "ECONNREFUSED" };
      mockPool.connect.mockRejectedValue(connectionError);

      await expect(pgClient.connect()).rejects.toThrow(AppError);
      await expect(pgClient.connect()).rejects.toMatchObject({
        code: "DB_UNAVAILABLE",
      });
    });

    it("should throw original error for non-mappable connection errors", async () => {
      const genericError = new Error("Unknown connection error");
      mockPool.connect.mockRejectedValue(genericError);

      await expect(pgClient.connect()).rejects.toThrow(genericError);
    });

    it("should log error on connection failure", async () => {
      const connectionError = { code: "ECONNREFUSED" };
      mockPool.connect.mockRejectedValue(connectionError);

      await expect(pgClient.connect()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("should end pool connection", async () => {
      mockPool.end.mockResolvedValue(undefined);

      await pgClient.disconnect();

      expect(mockPool.end).toHaveBeenCalled();
      expect(console.debug).toHaveBeenCalledWith("Database connection closed");
    });

    it("should throw mapped AppError for disconnect errors", async () => {
      const disconnectError = { code: "ECONNREFUSED" };
      mockPool.end.mockRejectedValue(disconnectError);

      await expect(pgClient.disconnect()).rejects.toThrow(AppError);
      await expect(pgClient.disconnect()).rejects.toMatchObject({
        code: "DB_UNAVAILABLE",
      });
    });

    it("should throw original error for non-mappable disconnect errors", async () => {
      const genericError = new Error("Unknown disconnect error");
      mockPool.end.mockRejectedValue(genericError);

      await expect(pgClient.disconnect()).rejects.toThrow(genericError);
    });

    it("should log error on disconnect failure", async () => {
      const disconnectError = { code: "ETIMEDOUT" };
      mockPool.end.mockRejectedValue(disconnectError);

      await expect(pgClient.disconnect()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
