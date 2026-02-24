import pg from "pg";
import { env } from "../../../shared/config/index.js";

export function createPgPool(): pg.Pool {
  const connectionString = env.databaseUrl;

  if (connectionString) {
    return new pg.Pool({ connectionString });
  }

  return new pg.Pool();
}
