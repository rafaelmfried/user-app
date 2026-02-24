import { User } from "../../../../src/domain/user/User";
import { Email } from "../../../../src/domain/value-objects/Email";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("User", () => {
  const createValidEmail = () => new Email("test@example.com");

  describe("creation with valid data", () => {
    it("should create user with name and email", () => {
      const email = createValidEmail();
      const user = new User("John Doe", email);

      expect(user.getName()).toBe("John Doe");
      expect(user.getEmail()).toBe(email);
      expect(user.getId()).toBeUndefined();
    });

    it("should create user with id when provided", () => {
      const email = createValidEmail();
      const user = new User("John Doe", email, 42);

      expect(user.getId()).toBe(42);
    });

    it("should create user with createdAt when provided", () => {
      const email = createValidEmail();
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const user = new User("John Doe", email, 1, createdAt);

      expect(user.getCreatedAt()).toBe(createdAt);
    });

    it("should set createdAt to now when not provided", () => {
      const email = createValidEmail();
      const before = new Date();
      const user = new User("John Doe", email);
      const after = new Date();

      expect(user.getCreatedAt().getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.getCreatedAt().getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("creation with invalid data", () => {
    const invalidNames = [
      { input: "", description: "empty string" },
      { input: "   ", description: "only spaces" },
      { input: "\t", description: "only tab" },
      { input: "\n", description: "only newline" },
    ];

    it.each(invalidNames)(
      "should throw ValidationError for name with $description",
      ({ input }) => {
        const email = createValidEmail();
        expect(() => new User(input, email)).toThrow(ValidationError);
        expect(() => new User(input, email)).toThrow("Name cannot be empty");
      }
    );
  });

  describe("setId()", () => {
    it("should set the user id", () => {
      const user = new User("John", createValidEmail());
      expect(user.getId()).toBeUndefined();

      user.setId(123);
      expect(user.getId()).toBe(123);
    });

    it("should override existing id", () => {
      const user = new User("John", createValidEmail(), 1);
      expect(user.getId()).toBe(1);

      user.setId(999);
      expect(user.getId()).toBe(999);
    });
  });

  describe("getters", () => {
    it("should return correct values for all getters", () => {
      const email = new Email("john@test.com");
      const createdAt = new Date("2024-06-15T10:00:00Z");
      const user = new User("John Doe", email, 42, createdAt);

      expect(user.getId()).toBe(42);
      expect(user.getName()).toBe("John Doe");
      expect(user.getEmail()).toBe(email);
      expect(user.getEmail().get()).toBe("john@test.com");
      expect(user.getCreatedAt()).toBe(createdAt);
    });
  });

  describe("edge cases", () => {
    it("should accept name with leading/trailing spaces (trimmed for validation)", () => {
      const user = new User("  John  ", createValidEmail());
      expect(user.getName()).toBe("  John  ");
    });

    it("should accept id of 0", () => {
      const user = new User("John", createValidEmail(), 0);
      expect(user.getId()).toBe(0);
    });

    it("should accept negative id (database might use this)", () => {
      const user = new User("John", createValidEmail(), -1);
      expect(user.getId()).toBe(-1);
    });
  });
});
