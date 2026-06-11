import { pgTable, serial, integer, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const reportReasonEnum = pgEnum("report_reason", [
  "fake_profile", "harassment", "inappropriate_content", "spam", "scam", "other",
]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "reviewed", "resolved", "dismissed"]);
export const documentTypeEnum = pgEnum("document_type", ["national_id", "passport", "driving_license"]);
export const verificationRequestStatusEnum = pgEnum("verification_request_status", ["pending", "approved", "rejected"]);

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterUserId: integer("reporter_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reportedUserId: integer("reported_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reason: reportReasonEnum("reason").notNull(),
  description: text("description"),
  status: reportStatusEnum("status").notNull().default("pending"),
  resolution: text("resolution"),
  actionTaken: text("action_taken"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blockedUsersTable = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  blockedId: integer("blocked_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const verificationsTable = pgTable("verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  documentUrl: text("document_url").notNull(),
  selfieUrl: text("selfie_url"),
  status: verificationRequestStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const otpsTable = pgTable("otps", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
