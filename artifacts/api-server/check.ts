import { db, journeyAnswersTable } from "@workspace/db";

async function main() {
  const answers = await db.select().from(journeyAnswersTable);
  console.log("Total answers:", answers.length);
  process.exit(0);
}

main().catch(console.error);
