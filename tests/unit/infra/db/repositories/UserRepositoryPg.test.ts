import { jest } from "@jest/globals";
import { UserRepositoryPg } from "../../../../../src/infra/db/repositories/UserRepositoryPg";
import { User } from "../../../../../src/domain/user/User";
import { Email } from "../../../../../src/domain/value-objects/Email";
import type { PgClient } from "../../../../../src/infra/db/client/PgClient";

describe("UserRepositoryPg", () => {
  let mockPgClient: jest.Mocked<PgClient>;
  let repository: UserRepositoryPg;

  beforeEach(() => {
    mockPgClient = {
      query: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as jest.Mocked<PgClient>;

    repository = new UserRepositoryPg(mockPgClient);
  });

  describe("create", () => {
    it("should insert user and return id", async () => {
      const user = new User("John", new Email("john@test.com"));
      mockPgClient.query.mockResolvedValue({
        rows: [{ id: 42 }],
        rowCount: 1,
      } as never);

      const result = await repository.create(user);

      expect(result.id).toBe(42);
      expect(mockPgClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        expect.arrayContaining(["John", "john@test.com"])
      );
    });

    it("should return -1 when no id is returned", async () => {
      const user = new User("John", new Email("john@test.com"));
      mockPgClient.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as never);

      const result = await repository.create(user);

      expect(result.id).toBe(-1);
    });
  });

  describe("findAll", () => {
    it("should return empty array when no users", async () => {
      mockPgClient.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as never);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it("should map rows to User entities", async () => {
      const createdAt = new Date("2024-01-01");
      mockPgClient.query.mockResolvedValue({
        rows: [
          { id: 1, name: "John", email: "john@test.com", created_at: createdAt },
          { id: 2, name: "Jane", email: "jane@test.com", created_at: createdAt },
        ],
        rowCount: 2,
      } as never);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0]?.getName()).toBe("John");
      expect(result[1]?.getName()).toBe("Jane");
    });
  });

  describe("findByEmail", () => {
    it("should return null when no user found", async () => {
      mockPgClient.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as never);

      const result = await repository.findByEmail("notfound@test.com");

      expect(result).toBeNull();
    });

    it("should return User when found", async () => {
      const createdAt = new Date("2024-01-01");
      mockPgClient.query.mockResolvedValue({
        rows: [{ id: 1, name: "John", email: "john@test.com", created_at: createdAt }],
        rowCount: 1,
      } as never);

      const result = await repository.findByEmail("john@test.com");

      expect(result).toBeInstanceOf(User);
      expect(result?.getName()).toBe("John");
      expect(result?.getEmail().get()).toBe("john@test.com");
    });

    it("should throw error when multiple users found with same email", async () => {
      const createdAt = new Date("2024-01-01");
      mockPgClient.query.mockResolvedValue({
        rows: [
          { id: 1, name: "John", email: "duplicate@test.com", created_at: createdAt },
          { id: 2, name: "Jane", email: "duplicate@test.com", created_at: createdAt },
        ],
        rowCount: 2,
      } as never);

      await expect(repository.findByEmail("duplicate@test.com")).rejects.toThrow(
        "Multiple users found with email: duplicate@test.com"
      );
    });

    it("should pass email parameter to query", async () => {
      mockPgClient.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as never);

      await repository.findByEmail("test@example.com");

      expect(mockPgClient.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE email = $1"),
        ["test@example.com"]
      );
    });
  });
});
