import { generateFullUserProfile } from "./src/services/profileGenerator.ts";
import { db, dailyJournalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  const journals = await db.select().from(dailyJournalsTable).where(eq(dailyJournalsTable.userId, 4));
  console.log("Mani's Journals:");
  journals.forEach(j => console.log(`- ${j.content}`));
  
  const profile = await generateFullUserProfile(4);
  console.log("\nMani's Generated Story Scores:");
  console.log(profile?.storyCategoryScores);
  process.exit(0);
}

run();
