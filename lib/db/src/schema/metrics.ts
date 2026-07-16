import { pgTable, date, integer } from "drizzle-orm/pg-core";

export const systemMetricsTable = pgTable("system_metrics", {
  date: date("date").primaryKey(), // YYYY-MM-DD
  aiRequests: integer("ai_requests").notNull().default(0),
  storiesAnalyzed: integer("stories_analyzed").notNull().default(0),
  cacheHits: integer("cache_hits").notNull().default(0),
});
