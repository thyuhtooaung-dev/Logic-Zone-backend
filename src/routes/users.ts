import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { user } from "../db/schema/index.js";
import { db } from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

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
        or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)),
      );
    }

    if (role) {
      filterCondition.push(eq(user.role, String(role) as typeof user.role.enumValues[number]));
    }

    const whereClause =
      filterCondition.length > 0 ? and(...filterCondition) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const usersList = await db
      .select({ ...getTableColumns(user) })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: usersList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (err) {
    console.log(`GET /users error: ${err}`);
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
