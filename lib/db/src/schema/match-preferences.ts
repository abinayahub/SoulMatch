import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const matchPreferencesTable = pgTable("match_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  minHeight: integer("min_height"),
  maxHeight: integer("max_height"),
  preferredReligions: text("preferred_religions").array(),
  preferredEducation: text("preferred_education").array(),
  preferredLocations: text("preferred_locations").array(),
  maritalStatus: text("marital_status").array(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMatchPreferencesSchema = createInsertSchema(matchPreferencesTable).omit({ id: true });
export type InsertMatchPreferences = z.infer<typeof insertMatchPreferencesSchema>;
export type MatchPreferences = typeof matchPreferencesTable.$inferSelect;
