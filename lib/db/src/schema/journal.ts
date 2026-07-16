import { pgTable, serial, integer, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const dailyJournalsTable = pgTable("daily_journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  aiAnalysis: jsonb("ai_analysis"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDailyJournalSchema = createInsertSchema(dailyJournalsTable).omit({ id: true, createdAt: true });
export type InsertDailyJournal = z.infer<typeof insertDailyJournalSchema>;
export type DailyJournal = typeof dailyJournalsTable.$inferSelect;
export const storyLikesTable = pgTable("story_likes", {
  id: serial("id").primaryKey(),
  journalId: integer("journal_id").notNull().references(() => dailyJournalsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const storyCommentsTable = pgTable("story_comments", {
  id: serial("id").primaryKey(),
  journalId: integer("journal_id").notNull().references(() => dailyJournalsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStoryCommentSchema = createInsertSchema(storyCommentsTable).omit({ id: true, createdAt: true });
export type InsertStoryComment = z.infer<typeof insertStoryCommentSchema>;
export type StoryComment = typeof storyCommentsTable.$inferSelect;
