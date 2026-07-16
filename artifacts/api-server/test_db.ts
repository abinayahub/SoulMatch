import { db } from "@workspace/db";
import { dailyJournalsTable, usersTable } from "@workspace/db";

async function main() {
  const journals = await db.select().from(dailyJournalsTable);
  const users = await db.select().from(usersTable);
  console.log("Journals count:", journals.length);
  console.log("Users count:", users.length);
  if (journals.length > 0) {
    console.log("First journal:", journals[0]);
  }
}
main().catch(console.error).finally(() => process.exit(0));
