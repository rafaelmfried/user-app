import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  testMatch: ["**/tests/**/*.test.ts"],

  // Reporter configuration for better readability
  reporters: [
    "<rootDir>/tests/setup/customReporter.ts",
    [
      "jest-html-reporters",
      {
        publicPath: "./coverage/html-report",
        filename: "test-report.html",
        openReport: false,
        pageTitle: "Test Report",
      },
    ],
  ],

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

  // Coverage
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/types/**",
    "!src/main.ts",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./src/**/*.ts": {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Setup
  globalSetup: "<rootDir>/tests/setup/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/setup/globalTeardown.ts",

  // Performance
  maxWorkers: "50%",

  // Clean state between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Timeouts
  testTimeout: 30000,
};

export default config;
