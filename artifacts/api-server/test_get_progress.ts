import { db } from "@workspace/db";
import { journeyAnswersTable, journeyQuestionsTable, usersTable, dailyJournalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  try {
    const user = await db.query.usersTable.findFirst();
    if (!user) throw new Error("No user found");
    const userId = user.id;

    console.log("Fetching questions and answers...");
    const questions = await db.select().from(journeyQuestionsTable).where(eq(journeyQuestionsTable.isActive, true));
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, userId));

    const totalQuestions = questions.length;
    const answeredQuestions = answers.length;
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    let currentDay = 1;
    for (let d = 1; d <= 30; d++) {
      const dayQs = questions.filter(q => q.day === d);
      if (dayQs.length === 0) continue;
      const allAnswered = dayQs.every(q => answers.some(a => a.questionId === q.id));
      if (!allAnswered) {
        currentDay = d;
        break;
      }
    }

    let unlockedAt: Date | null = null;
    let isLocked = false;
    let questionsRemainingToday = 0;

    if (user?.journeyStartedAt) {
      const started = new Date(user.journeyStartedAt);
      const now = new Date();
      const msPassed = now.getTime() - started.getTime();
      const daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));
      const maxAllowedDay = daysPassed + 1;

      if (currentDay > maxAllowedDay) {
        isLocked = true;
        unlockedAt = new Date(started.getTime() + (currentDay - 1) * 24 * 60 * 60 * 1000);
      }
      
      if (!isLocked) {
        const currentDayQs = questions.filter(q => q.day === currentDay);
        const currentDayAnswered = currentDayQs.filter(q => answers.some(a => a.questionId === q.id)).length;
        questionsRemainingToday = currentDayQs.length - currentDayAnswered;
      }
    } else {
      questionsRemainingToday = questions.filter(q => q.day === 1).length;
    }

    console.log("Fetching recent activity...");
    const recentActivity = await db.query.dailyJournalsTable.findFirst({
      where: eq(dailyJournalsTable.userId, userId),
      // order by descending to get most recent
    });

    console.log("Progress result:", {
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      currentDay,
      streak: Math.min(currentDay, 30),
      isLocked,
      unlockedAt,
    });

    process.exit(0);
  } catch (err) {
    console.error("FATAL ERROR:", err);
    process.exit(1);
  }
}

run();
