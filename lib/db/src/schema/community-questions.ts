import { pgTable, serial, integer, text, varchar, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const communityQuestionsTable = pgTable("community_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  userGender: varchar("user_gender", { length: 50 }).notNull(),
  text: text("text").notNull(),
  category: varchar("category", { length: 255 }).notNull().default("others"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("Pending"),
  answersCount: integer("answers_count").notNull().default(0),
  adminId: integer("admin_id").references(() => usersTable.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCommunityQuestionSchema = createInsertSchema(communityQuestionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCommunityQuestion = z.infer<typeof insertCommunityQuestionSchema>;
export type CommunityQuestion = typeof communityQuestionsTable.$inferSelect;

export const communityAnswersTable = pgTable("community_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => communityQuestionsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  answer: text("answer").notNull(),
  ignoredByOwner: boolean("ignored_by_owner").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.questionId, t.userId),
}));

export const insertCommunityAnswerSchema = createInsertSchema(communityAnswersTable).omit({ id: true, createdAt: true });
export type InsertCommunityAnswer = z.infer<typeof insertCommunityAnswerSchema>;
export type CommunityAnswer = typeof communityAnswersTable.$inferSelect;
