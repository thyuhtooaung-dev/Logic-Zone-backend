import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../db/index.js";
import * as schema from "../db/schema/auth.js";

const hasGoogleOAuth =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

const hasGithubOAuth =
  Boolean(process.env.GITHUB_CLIENT_ID) &&
  Boolean(process.env.GITHUB_CLIENT_SECRET);

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ].filter((value): value is string => Boolean(value))
  )
);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  advanced: {
    trustedProxyHeaders: true,
    cookieOptions: {
      useSecureCookies: true,
    },
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
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
