import { dailyJournalsTable, db } from "@workspace/db";

async function clear() {
  await db.delete(dailyJournalsTable);
  console.log("Deleted all journals!");
  process.exit(0);
}

clear().catch(console.error);
