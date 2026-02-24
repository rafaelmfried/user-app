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
  concurrency: 4,
  timeoutMS: 60000,
  // Explicit plugin loading for pnpm
  plugins: ["@stryker-mutator/jest-runner"],
  // Use mutation-specific jest config (only unit tests)
  jest: {
    configFile: "jest.mutation.config.ts",
  },
  // Ignore static mutants to speed up testing (31% of mutants take 76% of time)
  ignoreStatic: true,
  // Disable type checks for faster runs
  disableTypeChecks: "**/*.ts",
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
};
