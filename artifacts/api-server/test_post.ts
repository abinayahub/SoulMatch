import { db } from "@workspace/db";
import { journeyAnswersTable, journeyQuestionsTable, personalityProfilesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

async function run() {
  try {
    const questions = await db.query.journeyQuestionsTable.findMany();
    console.log("Total questions:", questions.length);
    console.log("Active questions:", questions.filter(q => q.isActive).length);
    
    const answers = await db.query.journeyAnswersTable.findMany();
    console.log("Total answers:", answers.length);

    const user = await db.query.usersTable.findFirst();
    if (!user) throw new Error("No user found");
    const userId = user.id;

    const questionId = 153; // Actual ID
    const answer = "A. With close family and loved ones.";

    const existing = await db.query.journeyAnswersTable.findFirst({
      where: and(eq(journeyAnswersTable.userId, userId), eq(journeyAnswersTable.questionId, questionId)),
    });
    
    if (existing) {
      console.log("Existing answer found, deleting for test");
      await db.delete(journeyAnswersTable).where(eq(journeyAnswersTable.id, existing.id));
    }

    console.log("Inserting answer...");
    const [created] = await db.insert(journeyAnswersTable).values({
      userId: userId, questionId, answer,
    }).returning();
    console.log("Answer inserted:", created.id);

    const question = await db.query.journeyQuestionsTable.findFirst({
      where: eq(journeyQuestionsTable.id, questionId)
    });

    if (question && question.options) {
      console.log("Question found, processing options...");
      const answerStr = String(answer);
      const optionIndex = question.options.findIndex((opt: string) => opt === answerStr || opt.startsWith(answerStr.charAt(0)));
      console.log("Option index:", optionIndex);
      
      if (optionIndex !== -1) {
        let optionLetter = 'A';
        if (optionIndex === 1) optionLetter = 'B';
        if (optionIndex === 2) optionLetter = 'C';
        if (optionIndex === 3) optionLetter = 'D';

        let subtrait = "Emotional Connection";
        if (optionLetter === 'A') {
          if (question.category === "Personality") subtrait = "Emotional & Caring";
          else if (question.category === "Lifestyle") subtrait = "Family & Friends Oriented";
          else if (question.category === "Family Values") subtrait = "Love & Emotional Support";
          else if (question.category === "Career Goals") subtrait = "Helping Others";
          else subtrait = "Emotional Communication"; 
        }

        console.log("Fetching profile...");
        let profile = await db.query.personalityProfilesTable.findFirst({
          where: eq(personalityProfilesTable.userId, userId)
        });

        let traits: any[] = [];
        if (profile && profile.traits) {
          try { 
            const parsed = JSON.parse(profile.traits);
            if (Array.isArray(parsed)) {
              traits = parsed;
            }
          } catch(e) {}
        }

        const existingSubtrait = traits.find((t: any) => t.trait === subtrait);
        if (existingSubtrait) {
          existingSubtrait.score += 10;
        } else {
          traits.push({ trait: subtrait, score: 10 });
        }

        const orientationMap: Record<string, string> = {
          'A': "Connection Oriented",
          'B': "Growth Oriented",
          'C': "Stability Oriented",
          'D': "Exploration Oriented"
        };
        const orientation = orientationMap[optionLetter] || "Connection Oriented";

        const existingOrientation = traits.find((t: any) => t.trait === orientation);
        if (existingOrientation) {
          existingOrientation.score += 10;
        } else {
          traits.push({ trait: orientation, score: 10 });
        }

        const orientations = traits.filter((t: any) => ["Connection Oriented", "Growth Oriented", "Stability Oriented", "Exploration Oriented"].includes(t.trait));
        orientations.sort((a: any, b: any) => b.score - a.score);
        const primary = orientations[0]?.trait || "Developing...";
        const secondary = orientations[1]?.trait || "Developing...";

        console.log("Saving profile...");
        if (profile) {
          await db.update(personalityProfilesTable).set({
            traits: JSON.stringify(traits),
            dominantType: primary,
            summary: `Primary Personality: ${primary} | Secondary Personality: ${secondary}`,
            generatedAt: new Date()
          }).where(eq(personalityProfilesTable.id, profile.id));
        } else {
          await db.insert(personalityProfilesTable).values({
            userId: userId,
            traits: JSON.stringify(traits),
            dominantType: primary,
            summary: `Primary Personality: ${primary} | Secondary Personality: ${secondary}`,
            generatedAt: new Date()
          });
        }
      }
    }

    console.log("Updating user progress...");
    await db.update(usersTable).set({
      journeyProgress: (user.journeyProgress ?? 0) + 1,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    console.log("Success!");
    process.exit(0);
  } catch (err) {
    console.error("FATAL ERROR:", err);
    process.exit(1);
  }
}

run();
