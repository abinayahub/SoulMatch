import { db } from "../lib/db/src/index.js";
import { journeyAnswersTable, journeyQuestionsTable, usersTable } from "../lib/db/src/schema/index.js";
import { eq } from "drizzle-orm";

async function run() {
  const users = await db.select().from(usersTable).where(eq(usersTable.firstName, "Nila"));
  if (users.length === 0) {
    console.log("User Nila not found");
    process.exit(1);
  }
  const user = users[0];
  console.log(`User ID: ${user.id}`);

  const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, user.id));
  console.log(`Answered questions: ${answers.length}`);
  
  const questions = await db.select().from(journeyQuestionsTable).where(eq(journeyQuestionsTable.isActive, true));
  
  let currentDay = 1;
  for (let d = 1; d <= 30; d++) {
    const dayQs = questions.filter(q => q.day === d);
    if (dayQs.length === 0) continue;
    const allAnswered = dayQs.every(q => answers.some(a => a.questionId === q.id));
    if (!allAnswered) {
      currentDay = d;
      const missing = dayQs.filter(q => !answers.some(a => a.questionId === q.id));
      console.log(`Day ${d} missing questions: ${missing.map(q => q.id).join(", ")}`);
      break;
    }
  }
  console.log(`Calculated Current Day: ${currentDay}`);
  process.exit(0);
}

run().catch(console.error);
