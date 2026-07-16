import { db, journeyAnswersTable, journeyQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, 1));
  console.log("Total answers:", answers.length);
  
  if (answers.length > 0) {
    console.log("Last answer time:", answers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt);
  }

  process.exit(0);
}

main().catch(console.error);
