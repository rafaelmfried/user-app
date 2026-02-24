import { toUserDTO } from "../../../../src/application/user/UserDTO";
import { User } from "../../../../src/domain/user/User";
import { Email } from "../../../../src/domain/value-objects/Email";

describe("toUserDTO", () => {
  describe("with all fields present", () => {
    it("should convert User to UserDTO with all fields", () => {
      const createdAt = new Date("2024-01-15T10:00:00Z");
      const user = new User("John Doe", new Email("john@test.com"), 42, createdAt);

      const dto = toUserDTO(user);

      expect(dto).toEqual({
        id: 42,
        name: "John Doe",
        email: "john@test.com",
        createdAt,
      });
    });
  });

  describe("without id", () => {
    it("should convert User to UserDTO without id when not set", () => {
      const user = new User("John Doe", new Email("john@test.com"));

      const dto = toUserDTO(user);

      expect(dto.id).toBeUndefined();
      expect(dto.name).toBe("John Doe");
      expect(dto.email).toBe("john@test.com");
      expect(dto.createdAt).toBeDefined();
    });
  });

  describe("with id of 0", () => {
    it("should include id when it is 0", () => {
      const user = new User("John", new Email("john@test.com"), 0);

      const dto = toUserDTO(user);

      expect(dto.id).toBe(0);
    });
  });

  describe("email extraction", () => {
    it("should extract email string from Email value object", () => {
      const email = new Email("test@example.com");
      const user = new User("Test", email, 1);

      const dto = toUserDTO(user);

      expect(dto.email).toBe("test@example.com");
      expect(typeof dto.email).toBe("string");
    });
  });

  describe("createdAt handling", () => {
    it("should include createdAt from user", () => {
      const createdAt = new Date("2024-06-15T12:00:00Z");
      const user = new User("John", new Email("john@test.com"), 1, createdAt);

      const dto = toUserDTO(user);

      expect(dto.createdAt).toBe(createdAt);
    });

    it("should include auto-generated createdAt", () => {
      const before = new Date();
      const user = new User("John", new Email("john@test.com"));
      const after = new Date();

      const dto = toUserDTO(user);

      expect(dto.createdAt).toBeDefined();
      expect(dto.createdAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(dto.createdAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("immutability", () => {
    it("should not affect original user when modifying DTO", () => {
      const user = new User("John", new Email("john@test.com"), 1);
      const dto = toUserDTO(user);

      // Modify DTO (TypeScript allows this on the object)
      (dto as { name: string }).name = "Modified";

      // Original user should be unchanged
      expect(user.getName()).toBe("John");
    });
  });

  describe("table-driven tests for various user states", () => {
    const testCases = [
      {
        description: "user with all fields",
        user: () => new User("Full", new Email("full@test.com"), 100, new Date("2024-01-01")),
        expected: { id: 100, name: "Full", email: "full@test.com" },
      },
      {
        description: "user without id",
        user: () => new User("NoId", new Email("noid@test.com")),
        expected: { id: undefined, name: "NoId", email: "noid@test.com" },
      },
      {
        description: "user with special characters in name",
        user: () => new User("João O'Brien", new Email("joao@test.com"), 1),
        expected: { id: 1, name: "João O'Brien", email: "joao@test.com" },
      },
    ];

    it.each(testCases)("should handle $description", ({ user, expected }) => {
      const dto = toUserDTO(user());

      expect(dto.id).toBe(expected.id);
      expect(dto.name).toBe(expected.name);
      expect(dto.email).toBe(expected.email);
    });
  });
});
