import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;

    const MAX_LIMIT = 100;
    const toInt = (value: unknown, fallback: number) => {
      const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
      return Number.isFinite(n) ? n : fallback;
    };
    const currentPage = Math.max(1, toInt(page, 1));
    const limitPerPage = Math.min(MAX_LIMIT, Math.max(1, toInt(limit, 10)));

    const offset = (currentPage - 1) * limitPerPage;

    const filterCondition = [];

    // if search query exists, filter by subject name OR subject code
    if (search) {
      filterCondition.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }

    // if department filter exists, match department name
    if (department) {
     const deptPattern = `%${String(department).replace(/[%_]/g, `\\$&`)}%`;
     filterCondition.push(ilike(departments.name, deptPattern))
    }

    // combine all filters using AND if any exist
    const whereClause =
      filterCondition.length > 0 ? and(...filterCondition) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPage: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (err) {
    console.log(`GET /subjects error: ${err}`);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

export default router;
