import pg from "pg";
import { mapPgError } from "./pgErrorMapper.js";

export class PgClient {
  private pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.pool = pool;
  }

  async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    queryText: string,
    params: unknown[] = [],
  ): Promise<pg.QueryResult<T>> {
    try {
      const res = await this.pool.query(queryText, params);
      return res;
    } catch (err) {
      const mapped = mapPgError(err);
      if (mapped) {
        console.error("Database query error:", mapped);
        throw mapped;
      }
      console.error("Database query error:", err);
      throw err;
    }
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      client.release();
      console.debug("Database connection established");
    } catch (err) {
      const mapped = mapPgError(err);
      if (mapped) {
        console.error("Database connection error:", mapped);
        throw mapped;
      }
      console.error("Database connection error:", err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      console.debug("Database connection closed");
    } catch (err) {
      const mapped = mapPgError(err);
      if (mapped) {
        console.error("Database disconnection error:", mapped);
        throw mapped;
      }
      console.error("Database disconnection error:", err);
      throw err;
    }
  }
}
