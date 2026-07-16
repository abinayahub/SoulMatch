import { generateFullUserProfile } from "./src/services/profileGenerator.ts";
import { db, dailyJournalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  const profile = await generateFullUserProfile(11);
  console.log("\nNila's Generated Story Scores:");
  console.log(profile?.storyCategoryScores);
  process.exit(0);
}

run();
