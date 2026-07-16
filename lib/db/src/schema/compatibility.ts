import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const compatibilityScoresTable = pgTable("compatibility_scores", {
  id: serial("id").primaryKey(),
  userAId: integer("user_a_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  userBId: integer("user_b_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  personalityMatch: integer("personality_match"),
  behavioralMatch: integer("behavioral_match"),
  aiStoryMatch: integer("ai_story_match"),
  breakdown: text("breakdown"), // Store JSON as text since we don't need to query by it
  sharedStrengths: text("shared_strengths"),
  potentialDifferences: text("potential_differences"),
  summary: text("summary"), // deterministic summary
  aiRelationshipSummary: text("ai_relationship_summary"), // Cache Gemini summary
  conversationStarters: text("conversation_starters"), // Cache Gemini generated starters (JSON)
  aiMatchInsights: text("ai_match_insights"), // Cache Gemini generated match insights (JSON)
  isPreliminary: integer("is_preliminary").default(0), // 0 or 1
  profileConfidence: integer("profile_confidence").default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
