import pg from "pg";

export class PgClient {
  private client: pg.Client;

  constructor(client: pg.Client) {
    this.client = client;
  }

  async query<T extends pg.QueryResultRow = any>(
    queryText: string,
    params?: unknown[],
  ): Promise<pg.QueryResult<T>> {
    try {
      const res = await this.client.query(queryText, params);
      return res;
    } catch (err) {
      console.error("Database query error:", err);
      throw err;
    }
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.debug("Database connection established");
    } catch (err) {
      console.error("Database connection error:", err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.end();
      console.debug("Database connection closed");
    } catch (err) {
      console.error("Database disconnection error:", err);
      throw err;
    }
  }
}
