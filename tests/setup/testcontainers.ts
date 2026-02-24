import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import * as fs from "node:fs";
import * as path from "node:path";
import pg from "pg";

export interface TestDatabaseContext {
  container: StartedPostgreSqlContainer;
  pool: pg.Pool;
  connectionString: string;
}

export async function createTestDatabase(): Promise<TestDatabaseContext> {
  const container = await new PostgreSqlContainer("postgres:18-alpine")
    .withDatabase("testdb")
    .withUsername("test")
    .withPassword("test")
    .start();

  const connectionString = container.getConnectionUri();

  const pool = new pg.Pool({ connectionString });

  // Run migrations
  await runMigrations(pool);

  return { container, pool, connectionString };
}

export async function destroyTestDatabase(
  context: TestDatabaseContext,
): Promise<void> {
  await context.pool.end();
  await context.container.stop();
}

export async function cleanDatabase(pool: pg.Pool): Promise<void> {
  await pool.query("TRUNCATE users RESTART IDENTITY CASCADE");
}

async function runMigrations(pool: pg.Pool): Promise<void> {
  // Use only the app migrations folder (not docker/migrations which has Docker-specific setup)
  const migrationsDir = path.join(process.cwd(), "migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.warn("No migrations directory found at:", migrationsDir);
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  files.sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    await pool.query(sql);
  }
}
