export function normalizeEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

export function normalizeOrigin(value?: string) {
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
}

export function getAllowedOrigins() {
  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
  const vercelOrigin = normalizeOrigin(process.env.VERCEL_URL);

  if (!frontendOrigin && !vercelOrigin) {
    throw new Error("FRONTEND_URL or VERCEL_URL needed");
  }

  return Array.from(
    new Set(
      [
        frontendOrigin,
        vercelOrigin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ].filter((value): value is string => Boolean(value))
    )
  );
}

export function getPort(defaultPort = 3000) {
  const raw = process.env.PORT?.trim();
  if (!raw) return defaultPort;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : defaultPort;
}

