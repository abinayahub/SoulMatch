import { pgTable, serial, integer, text, varchar, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const questionTypeEnum = pgEnum("question_type", ["text", "choice", "scale", "multi_choice"]);

export const journeyQuestionsTable = pgTable("journey_questions", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  question: text("question").notNull(),
  description: text("description"),
  questionType: questionTypeEnum("question_type").notNull().default("text"),
  options: text("options").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const journeyAnswersTable = pgTable("journey_answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => journeyQuestionsTable.id),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const personalityProfilesTable = pgTable("personality_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  traits: text("traits"),
  summary: text("summary"),
  compatibilityKeywords: text("compatibility_keywords").array(),
  dominantType: varchar("dominant_type", { length: 100 }),
  generatedAt: timestamp("generated_at"),
});

export const insertJourneyQuestionSchema = createInsertSchema(journeyQuestionsTable).omit({ id: true, createdAt: true });
export type InsertJourneyQuestion = z.infer<typeof insertJourneyQuestionSchema>;
export type JourneyQuestion = typeof journeyQuestionsTable.$inferSelect;

export const insertJourneyAnswerSchema = createInsertSchema(journeyAnswersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJourneyAnswer = z.infer<typeof insertJourneyAnswerSchema>;
export type JourneyAnswer = typeof journeyAnswersTable.$inferSelect;
