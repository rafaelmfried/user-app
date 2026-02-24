import pg from "pg";

export function createPgPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new pg.Pool({ connectionString });
  }

  return new pg.Pool();
}
