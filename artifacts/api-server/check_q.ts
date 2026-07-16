import { db, journeyQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const day2 = await db.select().from(journeyQuestionsTable).where(eq(journeyQuestionsTable.day, 2));
  console.log("Day 2 questions count:", day2.length);
  process.exit(0);
}

main().catch(console.error);
