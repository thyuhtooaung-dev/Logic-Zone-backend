import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../db/index.js";
import * as schema from "../db/schema/auth.js";

const normalizeEnvValue = (value?: string) =>
  value?.trim().replace(/^['"]|['"]$/g, "");

const normalizeOrigin = (value?: string) => {
  const normalized = normalizeEnvValue(value);
  if (!normalized) return undefined;

  const withProtocol = /^https?:\/\//i.test(normalized)
    ? normalized
    : `https://${normalized}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return undefined;
  }
};

const normalizeBaseURL = (value?: string) => {
  const normalized = normalizeEnvValue(value);
  if (!normalized) return undefined;

  const withProtocol = /^https?:\/\//i.test(normalized)
    ? normalized
    : `https://${normalized}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
};

const hasGoogleOAuth =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

const hasGithubOAuth =
  Boolean(process.env.GITHUB_CLIENT_ID) &&
  Boolean(process.env.GITHUB_CLIENT_SECRET);

type CookieSameSite = "lax" | "strict" | "none";

const isProduction = process.env.NODE_ENV === "production";
const parsedCookieSameSite = normalizeEnvValue(
  process.env.AUTH_COOKIE_SAME_SITE
)?.toLowerCase();
const cookieSameSite: CookieSameSite =
  parsedCookieSameSite === "none" ||
  parsedCookieSameSite === "lax" ||
  parsedCookieSameSite === "strict"
    ? parsedCookieSameSite
    : isProduction
      ? "none"
      : "lax";

const cookieSecure =
  process.env.AUTH_COOKIE_SECURE !== undefined
    ? normalizeEnvValue(process.env.AUTH_COOKIE_SECURE)?.toLowerCase() === "true"
    : cookieSameSite === "none" || isProduction;

const trustedOrigins = Array.from(
  new Set(
    [
      normalizeOrigin(process.env.FRONTEND_URL),
      normalizeOrigin(process.env.VERCEL_URL),
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ].filter((value): value is string => Boolean(value))
  )
);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: normalizeBaseURL(process.env.BETTER_AUTH_URL),
  trustedOrigins,
  advanced: {
    trustedProxyHeaders: true,
    useSecureCookies: cookieSecure,
    defaultCookieAttributes: {
      sameSite: cookieSameSite,
      secure: cookieSecure,
      httpOnly: true,
      path: "/",
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(
        `[Auth] Password reset link for ${user.email}: ${url}`
      );
    },
  },
  socialProviders: {
    ...(hasGoogleOAuth
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {}),
    ...(hasGithubOAuth
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
