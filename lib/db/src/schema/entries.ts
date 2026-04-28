import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moodValues = [
  "radiant",
  "calm",
  "neutral",
  "cloudy",
  "stormy",
] as const;

export type Mood = (typeof moodValues)[number];

export const entriesTable = pgTable(
  "entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    mood: varchar("mood", { length: 16 }).notNull(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    entryDate: date("entry_date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    entryDateIdx: index("entries_entry_date_idx").on(table.entryDate),
    createdAtIdx: index("entries_created_at_idx").on(table.createdAt),
    moodIdx: index("entries_mood_idx").on(table.mood),
  }),
);

export const insertEntrySchema = createInsertSchema(entriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entriesTable.$inferSelect;
