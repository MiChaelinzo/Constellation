import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { and, asc, desc, eq, gte, lte, sql, ilike } from "drizzle-orm";
import { db, entriesTable, moodValues } from "@workspace/db";
import {
  ListEntriesQueryParams,
  CreateEntryBody,
  GetEntryParams,
  UpdateEntryParams,
  UpdateEntryBody,
  DeleteEntryParams,
  GetSkyQueryParams,
  GetCalendarQueryParams,
  ListRecentEntriesQueryParams,
} from "@workspace/api-zod";
import { preview, starPositionFor } from "../lib/stars";

const router: IRouter = Router();

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function asDateOnly(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

function normalizeEntry<T extends { entryDate: unknown }>(row: T): T {
  return { ...row, entryDate: asDateOnly(row.entryDate) } as T;
}

// IMPORTANT: more specific routes must come before /entries/:id

router.get("/entries/recent", async (req, res): Promise<void> => {
  const parsed = ListRecentEntriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 5;

  const rows = await db
    .select()
    .from(entriesTable)
    .orderBy(desc(entriesTable.createdAt))
    .limit(limit);

  res.json({ entries: rows.map(normalizeEntry) });
});

router.get("/entries/calendar", async (req, res): Promise<void> => {
  const parsed = GetCalendarQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const { year, month } = parsed.data;

  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(year, month, 0)); // last day of month
  const end = endDate.toISOString().slice(0, 10);

  const rows = await db
    .select({
      date: entriesTable.entryDate,
      mood: entriesTable.mood,
    })
    .from(entriesTable)
    .where(
      and(gte(entriesTable.entryDate, start), lte(entriesTable.entryDate, end)),
    );

  const byDay = new Map<string, { count: number; moods: Set<string> }>();
  for (const r of rows) {
    const key = asDateOnly(r.date);
    if (!byDay.has(key)) byDay.set(key, { count: 0, moods: new Set() });
    const v = byDay.get(key)!;
    v.count += 1;
    v.moods.add(r.mood);
  }

  const days = Array.from(byDay.entries())
    .map(([date, v]) => ({
      date,
      count: v.count,
      moods: Array.from(v.moods),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({ year, month, days });
});

router.get("/entries", async (req, res): Promise<void> => {
  const parsed = ListEntriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const { mood, tag, from, to, search } = parsed.data;
  const limit = parsed.data.limit ?? 50;
  const offset = parsed.data.offset ?? 0;

  const conditions = [] as ReturnType<typeof eq>[];
  if (mood) conditions.push(eq(entriesTable.mood, mood));
  if (tag) {
    conditions.push(sql`${entriesTable.tags} @> ARRAY[${tag}]::text[]`);
  }
  if (from) {
    const fromStr = from instanceof Date ? from.toISOString().slice(0, 10) : String(from);
    conditions.push(gte(entriesTable.entryDate, fromStr));
  }
  if (to) {
    const toStr = to instanceof Date ? to.toISOString().slice(0, 10) : String(to);
    conditions.push(lte(entriesTable.entryDate, toStr));
  }
  if (search && search.trim().length > 0) {
    conditions.push(ilike(entriesTable.content, `%${search.trim()}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(entriesTable)
    .where(whereClause)
    .orderBy(desc(entriesTable.entryDate), desc(entriesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const totalRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entriesTable)
    .where(whereClause);

  res.json(
    ({
      entries: rows.map(normalizeEntry),
      total: totalRow[0]?.count ?? 0,
    }),
  );
});

router.post("/entries", async (req, res): Promise<void> => {
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const { content, mood, tags, entryDate } = parsed.data;
  if (!moodValues.includes(mood as (typeof moodValues)[number])) {
    res.status(400).json({ message: `Invalid mood: ${mood}` });
    return;
  }

  const dateStr = entryDate
    ? entryDate instanceof Date
      ? entryDate.toISOString().slice(0, 10)
      : String(entryDate)
    : todayIsoDate();

  const [row] = await db
    .insert(entriesTable)
    .values({
      content,
      mood,
      tags: (tags ?? []).filter((t) => t && t.trim().length > 0),
      entryDate: dateStr,
    })
    .returning();

  res.status(201).json(normalizeEntry(row));
});

router.get("/entries/:id", async (req, res): Promise<void> => {
  const parsed = GetEntryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }
  res.json(normalizeEntry(row));
});

router.patch("/entries/:id", async (req, res): Promise<void> => {
  const params = UpdateEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const body = UpdateEntryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ message: body.error.message });
    return;
  }

  const update: Record<string, unknown> = {};
  if (body.data.content !== undefined) update.content = body.data.content;
  if (body.data.mood !== undefined) update.mood = body.data.mood;
  if (body.data.tags !== undefined) {
    update.tags = body.data.tags.filter((t) => t && t.trim().length > 0);
  }
  if (body.data.entryDate !== undefined) {
    update.entryDate =
      body.data.entryDate instanceof Date
        ? body.data.entryDate.toISOString().slice(0, 10)
        : String(body.data.entryDate);
  }
  update.updatedAt = new Date();

  if (Object.keys(update).length === 1) {
    // only updatedAt was set
    const [row] = await db
      .select()
      .from(entriesTable)
      .where(eq(entriesTable.id, params.data.id));
    if (!row) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(normalizeEntry(row));
    return;
  }

  const [row] = await db
    .update(entriesTable)
    .set(update)
    .where(eq(entriesTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }

  res.json(normalizeEntry(row));
});

router.delete("/entries/:id", async (req, res): Promise<void> => {
  const params = DeleteEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  const [row] = await db
    .delete(entriesTable)
    .where(eq(entriesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/sky", async (req, res): Promise<void> => {
  const parsed = GetSkyQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 500;

  const rows = await db
    .select({
      id: entriesTable.id,
      mood: entriesTable.mood,
      content: entriesTable.content,
      entryDate: entriesTable.entryDate,
      createdAt: entriesTable.createdAt,
    })
    .from(entriesTable)
    .orderBy(asc(entriesTable.createdAt))
    .limit(limit);

  const stars = rows.map((r) => {
    const pos = starPositionFor(r.id);
    return {
      id: r.id,
      mood: r.mood,
      x: pos.x,
      y: pos.y,
      brightness: pos.brightness,
      preview: preview(r.content),
      entryDate: asDateOnly(r.entryDate),
      createdAt: r.createdAt,
    };
  });

  res.json({ stars });
});

router.get("/insights", async (_req, res): Promise<void> => {
  const all = await db
    .select({
      mood: entriesTable.mood,
      tags: entriesTable.tags,
      entryDate: entriesTable.entryDate,
    })
    .from(entriesTable);

  const totalEntries = all.length;

  const moodCountMap = new Map<string, number>();
  for (const m of moodValues) moodCountMap.set(m, 0);
  for (const row of all) {
    moodCountMap.set(row.mood, (moodCountMap.get(row.mood) ?? 0) + 1);
  }
  const moodCounts = moodValues.map((m) => ({
    mood: m,
    count: moodCountMap.get(m) ?? 0,
  }));

  const tagMap = new Map<string, number>();
  for (const row of all) {
    for (const raw of row.tags ?? []) {
      const t = raw?.trim();
      if (!t) continue;
      tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 12);

  const monthMap = new Map<string, number>();
  const dateSet = new Set<string>();
  for (const row of all) {
    const d = String(row.entryDate);
    dateSet.add(d);
    const month = d.slice(0, 7); // YYYY-MM
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
  }
  const perMonth = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const sortedDays = Array.from(dateSet).sort();
  let longestStreak = 0;
  let currentRun = 0;
  let prev: Date | null = null;
  for (const d of sortedDays) {
    const cur = new Date(d + "T00:00:00Z");
    if (prev && (cur.getTime() - prev.getTime()) / 86400000 === 1) {
      currentRun += 1;
    } else {
      currentRun = 1;
    }
    if (currentRun > longestStreak) longestStreak = currentRun;
    prev = cur;
  }

  // current streak: longest consecutive run ending today or yesterday
  let currentStreak = 0;
  if (sortedDays.length > 0) {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const yesterday = new Date(today.getTime() - 86400000)
      .toISOString()
      .slice(0, 10);
    const last = sortedDays[sortedDays.length - 1];
    if (last === todayKey || last === yesterday) {
      let cursor = new Date(last + "T00:00:00Z");
      const set = dateSet;
      while (set.has(cursor.toISOString().slice(0, 10))) {
        currentStreak += 1;
        cursor = new Date(cursor.getTime() - 86400000);
      }
    }
  }

  let dominantMood: string | null = null;
  let max = -1;
  for (const { mood, count } of moodCounts) {
    if (count > max) {
      max = count;
      dominantMood = count > 0 ? mood : null;
    }
  }

  res.json(
    ({
      totalEntries,
      currentStreak,
      longestStreak,
      daysJournaled: dateSet.size,
      moodCounts,
      topTags,
      perMonth,
      dominantMood,
    }),
  );
});

// Central error handler — last in this router
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err }, "Unhandled error in entries router");
  res.status(500).json({ message: "Internal server error" });
});

export default router;
