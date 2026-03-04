import express from "express";
import { db } from "../db/index.js";
import { classes } from "../db/schema/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const [createdClass] = await db
      .insert(classes)
      .values({
        ...req.body,
        inviteCode: Math.random().toString(36).substring(2, 9),
        schedules: [],
      })
      .returning();

    if (!createdClass) {
      throw new Error("Class creation failed");
    }

    res.status(201).json({ data: createdClass });
  } catch (e) {
    console.error(`POST /classes error ${e}`);
    const message = e instanceof Error ? e.message : "Failed to create class";
    res.status(500).json({ error: message });
  }
});

export default router;
