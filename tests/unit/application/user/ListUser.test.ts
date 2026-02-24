import { jest } from "@jest/globals";
import { ListUser } from "../../../../src/application/user/ListUser";
import type { UserRepositoryPort } from "../../../../src/domain/user/UserRepository";
import { User } from "../../../../src/domain/user/User";
import { Email } from "../../../../src/domain/value-objects/Email";

describe("ListUser", () => {
  let mockRepository: jest.Mocked<UserRepositoryPort>;
  let listUser: ListUser;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
    };
    listUser = new ListUser(mockRepository);
  });

  describe("execute", () => {
    it("should return empty array when no users exist", async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await listUser.execute();

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return array of UserDTOs when users exist", async () => {
      const users = [
        new User("John", new Email("john@test.com"), 1, new Date("2024-01-01")),
        new User("Jane", new Email("jane@test.com"), 2, new Date("2024-01-02")),
      ];
      mockRepository.findAll.mockResolvedValue(users);

      const result = await listUser.execute();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: "John",
        email: "john@test.com",
        createdAt: new Date("2024-01-01"),
      });
      expect(result[1]).toEqual({
        id: 2,
        name: "Jane",
        email: "jane@test.com",
        createdAt: new Date("2024-01-02"),
      });
    });

    it("should convert all users to DTOs", async () => {
      const users = [
        new User("User1", new Email("user1@test.com"), 1),
        new User("User2", new Email("user2@test.com"), 2),
        new User("User3", new Email("user3@test.com"), 3),
      ];
      mockRepository.findAll.mockResolvedValue(users);

      const result = await listUser.execute();

      expect(result).toHaveLength(3);
      result.forEach((dto, index) => {
        expect(dto.id).toBe(index + 1);
        expect(dto.name).toBe(`User${index + 1}`);
        expect(dto.email).toBe(`user${index + 1}@test.com`);
      });
    });

    it("should propagate repository errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findAll.mockRejectedValue(error);

      await expect(listUser.execute()).rejects.toThrow(error);
    });
  });
});
