import { db } from "@workspace/db";
import { journeyQuestionsTable, journeyAnswersTable, personalityProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function backfill() {
  console.log("Starting backfill for behavioralTraits...");
  
  const allUsers = await db.select().from(personalityProfilesTable);
  const questions = await db.select().from(journeyQuestionsTable);
  
  for (const profile of allUsers) {
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, profile.userId));
    if (answers.length === 0) continue;

    let behaviors: Record<string, number> = {};
    
    // Check if we already have some behaviors, though we want to recalculate to be perfectly clean
    // We will do a full recalculation.
    
    for (const a of answers) {
      const question = questions.find(q => q.id === a.questionId);
      if (!question || !question.options) continue;
      
      const answerStr = String(a.answer);
      const optionIndex = question.options.findIndex((opt: string) => opt === answerStr || opt.startsWith(answerStr.charAt(0)));
      
      if (optionIndex !== -1) {
        let optionLetter = 'A';
        if (optionIndex === 1) optionLetter = 'B';
        if (optionIndex === 2) optionLetter = 'C';
        if (optionIndex === 3) optionLetter = 'D';

        let behavioralUpdates: Record<string, number> = {};
        if (optionLetter === 'A') {
           behavioralUpdates["Family Orientation"] = 2;
           behavioralUpdates["Social Engagement"] = 1;
           behavioralUpdates["Communication Style"] = 1;
        } else if (optionLetter === 'B') {
           behavioralUpdates["Career Focus"] = 2;
           behavioralUpdates["Decision Making"] = 1;
        } else if (optionLetter === 'C') {
           behavioralUpdates["Emotional Maturity"] = 2;
           behavioralUpdates["Relationship Commitment"] = 2;
        } else if (optionLetter === 'D') {
           behavioralUpdates["Adventure Seeking"] = 2;
           behavioralUpdates["Decision Making"] = 1;
        }

        for (const [key, val] of Object.entries(behavioralUpdates)) {
           behaviors[key] = (behaviors[key] || 0) + val;
        }
      }
    }

    console.log(`Updating User ${profile.userId}: ${JSON.stringify(behaviors)}`);
    
    await db.update(personalityProfilesTable)
      .set({ behavioralTraits: JSON.stringify(behaviors) })
      .where(eq(personalityProfilesTable.id, profile.id));
  }
  
  console.log("Backfill complete.");
  process.exit(0);
}

backfill().catch(console.error);
