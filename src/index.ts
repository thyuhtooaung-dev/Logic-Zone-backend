import AgentAPI from "apminsight";
AgentAPI.config();

import express from "express";
import cors from "cors";

import subjectsRouter from "./routes/subjects.js"
import securityMiddleware from "./middleware/security.js";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

if(!process.env.FRONTEND_URL) {
  throw new Error("Missing FRONTEND_URL");
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware)

app.get("/", (req, res) => {
  res.send("Hello World!");
})

app.use("/api/subjects", subjectsRouter);

app.listen(port, host, () => {
  console.log(`Server started on ${host}:${port}`);
});
