import { db, journeyAnswersTable, journeyQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const answers = await db.select().from(journeyAnswersTable);
  const questions = await db.select().from(journeyQuestionsTable);
  
  const userAnswers = answers.filter(a => a.userId === 1);
  console.log("User 1 has", userAnswers.length, "answers");
  
  for (const a of userAnswers) {
    const q = questions.find(q => q.id === a.questionId);
    console.log(`Answered QID: ${a.questionId}, Day: ${q?.day}, IsActive: ${q?.isActive}`);
  }

  process.exit(0);
}

main().catch(console.error);
