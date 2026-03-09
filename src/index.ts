import('apminsight')
  .then(({ default: AgentAPI }) => AgentAPI.config())
  .catch(() => console.log('APM not available in this environment'));

import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";

import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import statsRouter from "./routes/stats.js";
import enrollmentsRouter from "./routes/enrollments.js";
import { auth } from "./lib/auth.js";

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

const app = express();
const PORT = 3000;

const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
const vercelOrigin = normalizeOrigin(process.env.VERCEL_URL);

if (!frontendOrigin && !vercelOrigin) {
  throw Error("FRONTEND_URL or VERCEL_URL needed");
}

const allowedOrigins = Array.from(
  new Set(
    [
      frontendOrigin,
      vercelOrigin,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ].filter((value): value is string => Boolean(value))
  )
);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/enrollments", enrollmentsRouter);

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
