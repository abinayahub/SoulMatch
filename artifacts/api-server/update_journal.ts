import { db } from "@workspace/db";
import { dailyJournalsTable } from "@workspace/db/schema";
import { isNotNull } from "drizzle-orm";

async function run() {
  const allJournals = await db.select().from(dailyJournalsTable);
  if (allJournals.length > 0) {
    const target = allJournals[0];
    const fakeAnalysis = {
      storyAnalysis: {
        familyOrientation: "High",
        careerFocus: "Moderate",
        emotionalMaturity: "High",
        relationshipCommitment: "High",
        adventureSeeking: "Low",
        summary: "This story shows a deep appreciation for meaningful connections and stable, long-term relationships over spontaneous adventures."
      }
    };
    await db.update(dailyJournalsTable)
      .set({ aiAnalysis: JSON.stringify(fakeAnalysis) })
      .where(isNotNull(dailyJournalsTable.id));
    console.log("Updated journals with AI analysis!");
  }
}
run().catch(console.error);
