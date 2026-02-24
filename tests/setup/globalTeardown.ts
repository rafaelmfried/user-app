export default async function globalTeardown(): Promise<void> {
  console.log("\n🧹 Global test teardown started...");
  console.log("✅ Global test teardown completed\n");
}
