import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { classes, subjects, user } from "../db/schema/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, subject, teacher, page = 1, limit = 10 } = req.query;

    const MAX_LIMIT = 100;
    const toInt = (value: unknown, fallback: number) => {
      const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
      return Number.isFinite(n) ? n : fallback;
    };
    const currentPage = Math.max(1, toInt(page, 1));
    const limitPerPage = Math.min(MAX_LIMIT, Math.max(1, toInt(limit, 10)));

    const offset = (currentPage - 1) * limitPerPage;

    const filterCondition = [];

    if (search) {
      filterCondition.push(
        or(
          ilike(classes.name, `%${search}%`),
          ilike(classes.inviteCode, `%${search}%`),
        ),
      );
    }

    if (subject) {
      const subjectPattern = `%${String(subject).replace(/[%_]/g, `\\$&`)}%`;
      filterCondition.push(ilike(subjects.name, subjectPattern));
    }

    if (teacher) {
      const teacherPattern = `%${String(teacher).replace(/[%_]/g, `\\$&`)}%`;
      filterCondition.push(ilike(user.name, teacherPattern));
    }

    const whereClause =
      filterCondition.length > 0 ? and(...filterCondition) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(classes)
      .leftJoin(subjects, eq(classes.subjectId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const classesList = await db
      .select({
        ...getTableColumns(classes),
        subject: { ...getTableColumns(subjects) },
        teacher: { ...getTableColumns(user) },
      })
      .from(classes)
      .leftJoin(subjects, eq(classes.subjectId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id))
      .where(whereClause)
      .orderBy(desc(classes.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: classesList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (err) {
    console.log(`GET /classes error: ${err}`);
    res.status(500).json({ error: "Failed to get classes" });
  }
});

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
