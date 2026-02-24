import { jest } from "@jest/globals";
import { CreateUser } from "../../../../src/application/user/CreateUser";
import type { UserRepositoryPort } from "../../../../src/domain/user/UserRepository";
import { User } from "../../../../src/domain/user/User";
import { Email } from "../../../../src/domain/value-objects/Email";
import { AppError } from "../../../../src/shared/errors/AppError";

describe("CreateUser", () => {
  let mockRepository: jest.Mocked<UserRepositoryPort>;
  let createUser: CreateUser;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
    };
    createUser = new CreateUser(mockRepository);
  });

  describe("successful creation", () => {
    it("should create user and return DTO", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ id: 1 });

      const result = await createUser.execute({
        name: "John Doe",
        email: "john@example.com",
      });

      expect(result).toEqual({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        createdAt: expect.any(Date),
      });
    });

    it("should check if email already exists", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ id: 1 });

      await createUser.execute({
        name: "John",
        email: "john@test.com",
      });

      expect(mockRepository.findByEmail).toHaveBeenCalledWith("john@test.com");
    });

    it("should call repository.create with User entity", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ id: 1 });

      await createUser.execute({
        name: "John",
        email: "john@test.com",
      });

      expect(mockRepository.create).toHaveBeenCalledWith(expect.any(User));
    });
  });

  describe("validation errors - missing fields", () => {
    const missingFieldCases = [
      { input: { name: "", email: "test@test.com" }, description: "empty name" },
      { input: { name: "John", email: "" }, description: "empty email" },
      { input: { name: "", email: "" }, description: "both empty" },
      { input: { name: null as unknown as string, email: "test@test.com" }, description: "null name" },
      { input: { name: "John", email: null as unknown as string }, description: "null email" },
      { input: { name: undefined as unknown as string, email: "test@test.com" }, description: "undefined name" },
      { input: { name: "John", email: undefined as unknown as string }, description: "undefined email" },
    ];

    it.each(missingFieldCases)(
      "should throw AppError for $description",
      async ({ input }) => {
        await expect(createUser.execute(input)).rejects.toThrow(AppError);
        await expect(createUser.execute(input)).rejects.toMatchObject({
          statusCode: 400,
          code: "VALIDATION_ERROR",
          message: "name and email are required",
        });
      }
    );
  });

  describe("validation errors - invalid email format", () => {
    it("should throw AppError for invalid email format", async () => {
      await expect(
        createUser.execute({ name: "John", email: "invalid-email" })
      ).rejects.toThrow(AppError);

      await expect(
        createUser.execute({ name: "John", email: "invalid-email" })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid email format",
      });
    });
  });

  describe("duplicate email", () => {
    it("should throw AppError when email already exists", async () => {
      const existingUser = new User(
        "Existing User",
        new Email("existing@test.com"),
        1
      );
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        createUser.execute({ name: "New User", email: "existing@test.com" })
      ).rejects.toThrow(AppError);

      await expect(
        createUser.execute({ name: "New User", email: "existing@test.com" })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Email already in use",
      });
    });

    it("should not call create when email exists", async () => {
      const existingUser = new User(
        "Existing User",
        new Email("existing@test.com"),
        1
      );
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        createUser.execute({ name: "New User", email: "existing@test.com" })
      ).rejects.toThrow();

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("repository errors", () => {
    it("should propagate AppError from repository", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(
        new AppError({
          statusCode: 500,
          code: "DB_ERROR",
          message: "Database error",
        })
      );

      await expect(
        createUser.execute({ name: "John", email: "john@test.com" })
      ).rejects.toThrow(AppError);
    });

    it("should propagate unknown errors", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      const unknownError = new Error("Unknown error");
      mockRepository.create.mockRejectedValue(unknownError);

      await expect(
        createUser.execute({ name: "John", email: "john@test.com" })
      ).rejects.toThrow(unknownError);
    });
  });
});
