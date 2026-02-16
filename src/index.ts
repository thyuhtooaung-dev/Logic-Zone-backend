import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subjects"

const app = express();
const port = 3000

if(!process.env.FRONTEND_URL) {
  throw new Error("Missing FRONTEND_URL");
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
})

app.use("/api/subjects", subjectsRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})