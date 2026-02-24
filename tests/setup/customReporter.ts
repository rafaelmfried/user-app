/* eslint-disable @typescript-eslint/no-explicit-any */
type AggregatedResult = any;
type TestResult = any;
type Test = any;
type TestContext = any;

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  white: "\x1b[37m",
};

const icons = {
  pass: "✓",
  fail: "✗",
  skip: "○",
  suite: "❯",
  time: "⏱",
  file: "📄",
};

class CustomReporter {
  private startTime: number = Date.now();

  onRunStart(): void {
    console.log("\n");
    console.log(
      `${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}                       RUNNING TESTS${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
    );
    console.log("\n");
  }

  onTestResult(
    _test: Test,
    testResult: TestResult,
    _aggregatedResult: AggregatedResult
  ): void {
    const fileName = testResult.testFilePath.split("/").pop() || "";
    const relativePath = testResult.testFilePath.replace(process.cwd(), "");

    const passed = testResult.numPassingTests;
    const failed = testResult.numFailingTests;
    const skipped = testResult.numPendingTests;
    const duration = ((testResult.perfStats.end - testResult.perfStats.start) / 1000).toFixed(2);

    // File header
    const status =
      failed > 0
        ? `${colors.bgRed}${colors.white} FAIL ${colors.reset}`
        : `${colors.bgGreen}${colors.white} PASS ${colors.reset}`;

    console.log(`${status} ${colors.dim}${relativePath}${colors.reset}`);

    // Group tests by describe block
    const groups: Map<string, typeof testResult.testResults> = new Map();

    for (const test of testResult.testResults) {
      const parts = test.ancestorTitles;
      const groupKey = parts.join(" › ");
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(test);
    }

    // Print grouped results
    for (const [groupName, tests] of groups) {
      if (groupName) {
        console.log(
          `     ${colors.cyan}${icons.suite} ${groupName}${colors.reset}`
        );
      }

      for (const test of tests) {
        const testDuration = test.duration ? `${test.duration}ms` : "";
        const indent = groupName ? "       " : "     ";

        if (test.status === "passed") {
          console.log(
            `${indent}${colors.green}${icons.pass}${colors.reset} ${colors.dim}${test.title}${colors.reset} ${colors.gray}${testDuration}${colors.reset}`
          );
        } else if (test.status === "failed") {
          console.log(
            `${indent}${colors.red}${icons.fail} ${test.title}${colors.reset} ${colors.gray}${testDuration}${colors.reset}`
          );
          // Show failure message
          for (const msg of test.failureMessages) {
            const lines = msg.split("\n").slice(0, 5);
            for (const line of lines) {
              console.log(`${indent}  ${colors.red}${line}${colors.reset}`);
            }
          }
        } else if (test.status === "pending") {
          console.log(
            `${indent}${colors.yellow}${icons.skip} ${test.title}${colors.reset} ${colors.gray}(skipped)${colors.reset}`
          );
        }
      }
    }

    // File summary
    console.log(
      `     ${colors.gray}${icons.time} ${duration}s${colors.reset}\n`
    );
  }

  onRunComplete(
    _contexts: Set<TestContext>,
    results: AggregatedResult
  ): void {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const passed = results.numPassedTests;
    const failed = results.numFailedTests;
    const skipped = results.numPendingTests;
    const total = results.numTotalTests;
    const suites = results.numTotalTestSuites;

    console.log(
      `${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}                        SUMMARY${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
    );
    console.log("");

    // Test suites
    console.log(
      `  ${colors.bright}Test Suites:${colors.reset}  ${
        results.numFailedTestSuites > 0
          ? `${colors.red}${results.numFailedTestSuites} failed${colors.reset}, `
          : ""
      }${colors.green}${results.numPassedTestSuites} passed${colors.reset}, ${suites} total`
    );

    // Tests
    console.log(
      `  ${colors.bright}Tests:${colors.reset}        ${
        failed > 0 ? `${colors.red}${failed} failed${colors.reset}, ` : ""
      }${skipped > 0 ? `${colors.yellow}${skipped} skipped${colors.reset}, ` : ""}${colors.green}${passed} passed${colors.reset}, ${total} total`
    );

    // Time
    console.log(`  ${colors.bright}Time:${colors.reset}         ${duration}s`);

    console.log("");

    // Final status
    if (failed === 0) {
      console.log(
        `  ${colors.bgGreen}${colors.white}${colors.bright}  ALL TESTS PASSED  ${colors.reset}`
      );
    } else {
      console.log(
        `  ${colors.bgRed}${colors.white}${colors.bright}  ${failed} TEST${failed > 1 ? "S" : ""} FAILED  ${colors.reset}`
      );
    }

    console.log("\n");
  }
}

export default CustomReporter;
