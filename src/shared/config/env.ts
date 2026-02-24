export type NodeEnv = "development" | "production" | "test";

export type AppEnv = {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl?: string;
  debugErrors: boolean;
};

function toNodeEnv(value: string | undefined): NodeEnv {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }
  return "development";
}

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBool(value: string | undefined): boolean {
  if (!value) return false;
  return (
    value === "1" ||
    value.toLowerCase() === "true" ||
    value.toLowerCase() === "yes"
  );
}

export const env: AppEnv = {
  nodeEnv: toNodeEnv(process.env.NODE_ENV),
  port: toNumber(process.env.PORT, 8080),
  databaseUrl: process.env.DATABASE_URL || "",
  debugErrors: toBool(process.env.DEBUG) || toBool(process.env.DEBUG_ERRORS),
};
