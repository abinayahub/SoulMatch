import { eq } from "drizzle-orm";
import { db } from "./lib/db/src/index";
import { dailyJournalsTable } from "./lib/db/src/schema/journal";

async function run() {
  console.log("Cleaning up old API errors from journals...");
  const journals = await db.query.dailyJournalsTable.findMany();
  
  for (const j of journals) {
    if (j.aiAnalysis) {
      let changed = false;
      let analysis = j.aiAnalysis as any;
      
      if (analysis?.storyAnalysis?.summary?.includes("GoogleGenerativeAI Error")) {
        analysis.storyAnalysis.summary = "AI insights are currently unavailable. Rate limit exceeded.";
        changed = true;
      }
      
      if (analysis?.cumulativeProfile?.summary?.includes("GoogleGenerativeAI Error")) {
        analysis.cumulativeProfile.summary = "AI insights are currently unavailable. Rate limit exceeded.";
        changed = true;
      }
      
      if (changed) {
        await db.update(dailyJournalsTable)
          .set({ aiAnalysis: analysis })
          .where(eq(dailyJournalsTable.id, j.id));
        console.log(`Cleaned journal ID ${j.id}`);
      }
    }
  }
  console.log("Done");
  process.exit(0);
}

run().catch(console.error);
