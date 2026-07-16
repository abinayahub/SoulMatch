import { pgTable, serial, integer, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const dailyReflectionsTable = pgTable("daily_reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull(),
  answer: text("answer").notNull(),
  reflectionDate: date("reflection_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userReflectionStatsTable = pgTable("user_reflection_stats", {
  userId: integer("user_id").primaryKey().references(() => usersTable.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastReflectionDate: date("last_reflection_date"),
  totalReflections: integer("total_reflections").notNull().default(0),
});

export const insertDailyReflectionSchema = createInsertSchema(dailyReflectionsTable).omit({ id: true, createdAt: true });
export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type DailyReflection = typeof dailyReflectionsTable.$inferSelect;

export const insertUserReflectionStatsSchema = createInsertSchema(userReflectionStatsTable);
export type InsertUserReflectionStats = z.infer<typeof insertUserReflectionStatsSchema>;
export type UserReflectionStats = typeof userReflectionStatsTable.$inferSelect;
