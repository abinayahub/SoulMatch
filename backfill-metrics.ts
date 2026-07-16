import { db, dailyJournalsTable, systemMetricsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Backfilling historical metrics...");
  
  const journals = await db.select().from(dailyJournalsTable);
  const totalStories = journals.length;
  // Historically, every story triggered 2 API calls (analyzeStory + analyzeCumulativeProfile)
  const historicalApiRequests = totalStories * 2;
  
  const today = new Date().toISOString().split('T')[0];
  
  const existing = await db.query.systemMetricsTable.findFirst({
    where: eq(systemMetricsTable.date, today)
  });

  if (existing) {
    await db.update(systemMetricsTable).set({
      storiesAnalyzed: existing.storiesAnalyzed + totalStories,
      aiRequests: existing.aiRequests + historicalApiRequests,
    }).where(eq(systemMetricsTable.date, today));
  } else {
    await db.insert(systemMetricsTable).values({
      date: today,
      storiesAnalyzed: totalStories,
      aiRequests: historicalApiRequests,
      cacheHits: 0
    });
  }

  console.log(`Backfilled: ${totalStories} stories, ${historicalApiRequests} AI requests.`);
  process.exit(0);
}

run().catch(console.error);
