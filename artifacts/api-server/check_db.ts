import { db } from "@workspace/db";
import { dailyJournalsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

async function run() {
  const res = await db.select().from(dailyJournalsTable).orderBy(desc(dailyJournalsTable.id)).limit(1);
  console.log(JSON.stringify(res[0].aiAnalysis, null, 2));
}
run().catch(console.error);
