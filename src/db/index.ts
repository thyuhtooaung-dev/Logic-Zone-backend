import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const resilientFetch: typeof fetch = async (input, init = {}) => {
  const maxAttempts = 3;
  const timeoutMs = 20000;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(input, {
        ...init,
        signal: init.signal ?? controller.signal,
      });
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(300 * attempt);
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
};

neonConfig.fetchConnectionCache = true;
neonConfig.fetchFunction = resilientFetch;

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
