import { ValidationError } from "../../../../src/domain/errors/ValidationError";
import { Email } from "../../../../src/domain/value-objects/Email";

describe("Email", () => {
  describe("creation with valid emails", () => {
    const validEmails = [
      { input: "user@example.com", description: "simple email" },
      { input: "user.name@domain.com", description: "email with dot in local" },
      { input: "user+tag@domain.com", description: "email with plus sign" },
      {
        input: "user@subdomain.domain.com",
        description: "email with subdomain",
      },
      { input: "user@domain.co", description: "email with short TLD" },
      { input: "USER@DOMAIN.COM", description: "uppercase email" },
      { input: "123@domain.com", description: "numeric local part" },
    ];

    it.each(validEmails)(
      "should create email for $description: $input",
      ({ input }) => {
        const email = new Email(input);
        expect(email.get()).toBe(input);
      },
    );
  });

  describe("creation with invalid emails", () => {
    const invalidEmails = [
      { input: "invalid", description: "no @ symbol" },
      { input: "", description: "empty string" },
      { input: "@domain.com", description: "no local part" },
      { input: "user@", description: "no domain" },
      { input: "user@domain", description: "no TLD" },
      { input: "user domain@test.com", description: "space in local part" },
      { input: "user@domain .com", description: "space in domain" },
      { input: "user@@domain.com", description: "double @" },
      { input: " user@domain.com", description: "leading space" },
      { input: "user@domain.com ", description: "trailing space" },
    ];

    it.each(invalidEmails)(
      "should throw ValidationError for $description: '$input'",
      ({ input }) => {
        expect(() => new Email(input)).toThrow(ValidationError);
        expect(() => new Email(input)).toThrow("Invalid email format");
      },
    );
  });

  describe("get()", () => {
    it("should return the email value", () => {
      const email = new Email("test@example.com");
      expect(email.get()).toBe("test@example.com");
    });

    it("should return exactly what was passed in constructor", () => {
      const input = "MixedCase@Domain.COM";
      const email = new Email(input);
      expect(email.get()).toBe(input);
    });
  });

  describe("immutability", () => {
    it("should not allow modification of internal value", () => {
      const email = new Email("original@test.com");
      const value = email.get();

      expect(email.get()).toBe("original@test.com");
      expect(value).toBe("original@test.com");
    });
  });
});
