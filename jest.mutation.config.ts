import type { Config } from "jest";

// Standalone config for mutation testing (only unit tests, no testcontainers)
const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  // Only run unit tests for mutation testing
  testMatch: ["**/tests/unit/**/*.test.ts"],

  // ESM Support
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "bundler",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
        },
      },
    ],
  },

  // Disable reporters for faster execution
  reporters: ["default"],

  // Disable coverage during mutation testing
  collectCoverage: false,

  // Use all workers for faster mutation testing
  maxWorkers: "100%",

  // Clean state between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Timeouts
  testTimeout: 30000,
};

export default config;
