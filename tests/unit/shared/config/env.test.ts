import { toNodeEnv, toNumber, toBool } from "../../../../src/shared/config/env";

describe("env helpers", () => {
  describe("toNodeEnv", () => {
    const validEnvs = [
      { input: "development", expected: "development" },
      { input: "production", expected: "production" },
      { input: "test", expected: "test" },
    ];

    it.each(validEnvs)(
      "should return '$expected' for '$input'",
      ({ input, expected }) => {
        expect(toNodeEnv(input)).toBe(expected);
      }
    );

    const invalidEnvs = [
      { input: undefined, description: "undefined" },
      { input: "", description: "empty string" },
      { input: "staging", description: "invalid value" },
      { input: "PRODUCTION", description: "uppercase" },
      { input: "dev", description: "short form" },
    ];

    it.each(invalidEnvs)(
      "should return 'development' for $description",
      ({ input }) => {
        expect(toNodeEnv(input)).toBe("development");
      }
    );
  });

  describe("toNumber", () => {
    const validNumbers = [
      { input: "8080", fallback: 3000, expected: 8080 },
      { input: "0", fallback: 3000, expected: 0 },
      { input: "3.14", fallback: 0, expected: 3.14 },
      { input: "-100", fallback: 0, expected: -100 },
      { input: "1e5", fallback: 0, expected: 100000 },
    ];

    it.each(validNumbers)(
      "should return $expected for '$input'",
      ({ input, fallback, expected }) => {
        expect(toNumber(input, fallback)).toBe(expected);
      }
    );

    const fallbackCases = [
      { input: undefined, fallback: 8080, description: "undefined" },
      { input: "", fallback: 3000, description: "empty string" },
      { input: "not-a-number", fallback: 5000, description: "invalid string" },
      { input: "NaN", fallback: 1234, description: "NaN string" },
      { input: "Infinity", fallback: 9999, description: "Infinity (not finite)" },
    ];

    it.each(fallbackCases)(
      "should return fallback for $description",
      ({ input, fallback }) => {
        expect(toNumber(input, fallback)).toBe(fallback);
      }
    );
  });

  describe("toBool", () => {
    const truthy = [
      { input: "1", description: "string '1'" },
      { input: "true", description: "lowercase 'true'" },
      { input: "TRUE", description: "uppercase 'TRUE'" },
      { input: "True", description: "capitalized 'True'" },
      { input: "yes", description: "lowercase 'yes'" },
      { input: "YES", description: "uppercase 'YES'" },
      { input: "Yes", description: "capitalized 'Yes'" },
    ];

    it.each(truthy)("should return true for $description", ({ input }) => {
      expect(toBool(input)).toBe(true);
    });

    const falsy = [
      { input: undefined, description: "undefined" },
      { input: "", description: "empty string" },
      { input: "0", description: "string '0'" },
      { input: "false", description: "string 'false'" },
      { input: "no", description: "string 'no'" },
      { input: "random", description: "random string" },
    ];

    it.each(falsy)("should return false for $description", ({ input }) => {
      expect(toBool(input)).toBe(false);
    });
  });
});
