import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const interestStatusEnum = pgEnum("interest_status", ["pending", "accepted", "declined", "withdrawn"]);

export const interestsTable = pgTable("interests", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  toUserId: integer("to_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: interestStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInterestSchema = createInsertSchema(interestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type Interest = typeof interestsTable.$inferSelect;
