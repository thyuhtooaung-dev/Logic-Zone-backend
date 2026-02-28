import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const normalizeDatabaseUrl = (value: string | undefined) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  const unwrapped = trimmed.replace(/^['\"]|['\"]$/g, "");
  return unwrapped;
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);
