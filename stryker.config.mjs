/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "pnpm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  testRunnerNodeArgs: ["--experimental-vm-modules"],
  coverageAnalysis: "perTest",
  mutate: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/main.ts",
    "!src/types/**",
    "!src/**/index.ts",
  ],
  thresholds: {
    high: 80,
    low: 70,
    break: 65,
  },
  concurrency: 2,
  timeoutMS: 60000,
  // Only run unit tests for mutation (faster)
  jest: {
    configFile: "jest.config.ts",
    enableFindRelatedTests: true,
  },
  // Ignore integration/e2e for mutation testing
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
};
