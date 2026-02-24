import { jest } from "@jest/globals";

describe("createPgPool", () => {
  let mockPool: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mockPool = jest.fn();
  });

  describe("with DATABASE_URL set", () => {
    it("should create pool with connection string", async () => {
      // Mock pg module
      jest.unstable_mockModule("pg", () => ({
        default: {
          Pool: mockPool,
        },
      }));

      // Mock env with databaseUrl
      jest.unstable_mockModule(
        "../../../../../src/shared/config/index.js",
        () => ({
          env: {
            databaseUrl: "postgresql://user:pass@localhost:5432/testdb",
          },
        }),
      );

      // Import after mocking
      const { createPgPool } =
        await import("../../../../../src/infra/db/client/createPool");

      createPgPool();

      expect(mockPool).toHaveBeenCalledWith({
        connectionString: "postgresql://user:pass@localhost:5432/testdb",
      });
    });
  });

  describe("without DATABASE_URL", () => {
    it("should create pool with default config", async () => {
      // Mock pg module
      jest.unstable_mockModule("pg", () => ({
        default: {
          Pool: mockPool,
        },
      }));

      // Mock env without databaseUrl
      jest.unstable_mockModule(
        "../../../../../src/shared/config/index.js",
        () => ({
          env: {
            databaseUrl: "",
          },
        }),
      );

      // Import after mocking
      const { createPgPool } =
        await import("../../../../../src/infra/db/client/createPool");

      createPgPool();

      expect(mockPool).toHaveBeenCalledWith();
    });

    it("should create pool with default config when databaseUrl is undefined", async () => {
      // Mock pg module
      jest.unstable_mockModule("pg", () => ({
        default: {
          Pool: mockPool,
        },
      }));

      // Mock env with undefined databaseUrl
      jest.unstable_mockModule(
        "../../../../../src/shared/config/index.js",
        () => ({
          env: {
            databaseUrl: undefined,
          },
        }),
      );

      // Import after mocking
      const { createPgPool } =
        await import("../../../../../src/infra/db/client/createPool");

      createPgPool();

      expect(mockPool).toHaveBeenCalledWith();
    });
  });

  describe("pool instance", () => {
    it("should return a Pool instance", async () => {
      const mockPoolInstance = { query: jest.fn() };
      mockPool.mockReturnValue(mockPoolInstance);

      jest.unstable_mockModule("pg", () => ({
        default: {
          Pool: mockPool,
        },
      }));

      jest.unstable_mockModule(
        "../../../../../src/shared/config/index.js",
        () => ({
          env: {
            databaseUrl: "postgresql://localhost/test",
          },
        }),
      );

      const { createPgPool } =
        await import("../../../../../src/infra/db/client/createPool");

      const pool = createPgPool();

      expect(pool).toBe(mockPoolInstance);
    });
  });
});
