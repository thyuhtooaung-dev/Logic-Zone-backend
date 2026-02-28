import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const normalizeDatabaseUrl = (value: string | undefined) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  const unwrapped = trimmed.replace(/^['\"]|['\"]$/g, "");
  return unwrapped;
};

const databaseUrl =
  normalizeDatabaseUrl(process.env.MIGRATION_DATABASE_URL) ??
  normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!databaseUrl) {
  throw new Error(
    "Set MIGRATION_DATABASE_URL or DATABASE_URL in .env before running migrations",
  );
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
