import { db, journeyAnswersTable } from "@workspace/db";
import { count } from "drizzle-orm";

async function main() {
  const all = await db.select().from(journeyAnswersTable);
  console.log("All answers:");
  const counts: Record<number, number> = {};
  for (const a of all) {
    counts[a.userId] = (counts[a.userId] || 0) + 1;
  }
  console.log(counts);
  process.exit(0);
}

main().catch(console.error);
