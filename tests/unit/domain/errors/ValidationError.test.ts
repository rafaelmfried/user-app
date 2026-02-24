import { DomainError } from "../../../../src/domain/errors/DomainError";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("ValidationError", () => {
  describe("inheritance", () => {
    it("should be instance of Error", () => {
      const error = new ValidationError("test");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be instance of DomainError", () => {
      const error = new ValidationError("test");
      expect(error).toBeInstanceOf(DomainError);
    });

    it("should be instance of ValidationError", () => {
      const error = new ValidationError("test");
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe("properties", () => {
    it("should have name set to 'ValidationError'", () => {
      const error = new ValidationError("test message");
      expect(error.name).toBe("ValidationError");
    });

    it("should have correct message", () => {
      const error = new ValidationError("This is the error message");
      expect(error.message).toBe("This is the error message");
    });

    it("should have stack trace", () => {
      const error = new ValidationError("test");
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ValidationError");
    });
  });

  describe("throwing and catching", () => {
    it("should be catchable as ValidationError", () => {
      const throwError = () => {
        throw new ValidationError("validation failed");
      };

      expect(throwError).toThrow(ValidationError);
    });

    it("should be catchable as DomainError", () => {
      const throwError = () => {
        throw new ValidationError("validation failed");
      };

      expect(throwError).toThrow(DomainError);
    });

    it("should be distinguishable from generic Error", () => {
      const validationError = new ValidationError("validation");
      const genericError = new Error("generic");

      expect(validationError instanceof ValidationError).toBe(true);
      expect(genericError instanceof ValidationError).toBe(false);
    });
  });
});

describe("DomainError", () => {
  describe("properties", () => {
    it("should have name set to 'DomainError'", () => {
      const error = new DomainError("test");
      expect(error.name).toBe("DomainError");
    });

    it("should have correct message", () => {
      const error = new DomainError("domain error message");
      expect(error.message).toBe("domain error message");
    });
  });

  describe("inheritance", () => {
    it("should be instance of Error", () => {
      const error = new DomainError("test");
      expect(error).toBeInstanceOf(Error);
    });
  });
});
