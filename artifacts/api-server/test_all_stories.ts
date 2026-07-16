import { db, dailyJournalsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  const users = await db.select().from(usersTable);
  for (const user of users) {
    console.log(`User ID: ${user.id} - ${user.firstName}`);
    const journals = await db.select().from(dailyJournalsTable).where(eq(dailyJournalsTable.userId, user.id));
    for (const j of journals) {
      console.log(`  - ${j.content.replace(/\n/g, "\\n")}`);
    }
  }
  process.exit(0);
}

run();
