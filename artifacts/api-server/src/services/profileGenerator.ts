import { db, journeyAnswersTable, journeyQuestionsTable, dailyJournalsTable, personalityProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { calculateUnifiedScores, generateProfileInsights, UNIFIED_CATEGORIES, convertUnifiedToLegacyTraits, analyzeStoryKeywords } from "./keywordAnalysis";

export async function generateFullUserProfile(userId: number) {
  // 1. Fetch all journey answers and questions
  const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, userId));
  const questions = await db.select().from(journeyQuestionsTable);

  const qScores: Record<string, number> = {
    "Connection": 0,
    "Growth": 0,
    "Stability": 0,
    "Exploration": 0
  };

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.options) {
      const answerStr = String(answer.answer);
      const optionIndex = question.options.findIndex((opt: string) => opt === answerStr || opt.startsWith(answerStr.charAt(0)));
      
      if (optionIndex !== -1) {
        const optionLetter = ['A', 'B', 'C', 'D'][optionIndex] || 'A';

        if (optionLetter === 'A') qScores["Connection"] += 10;
        else if (optionLetter === 'B') qScores["Growth"] += 10;
        else if (optionLetter === 'C') qScores["Stability"] += 10;
        else if (optionLetter === 'D') qScores["Exploration"] += 10;
      }
    }
  }

  // Populate sub-categories for backward compatibility
  qScores["Family Values"] = qScores["Connection"];
  qScores["Social Engagement"] = qScores["Connection"];
  qScores["Kindness & Empathy"] = qScores["Connection"];
  qScores["Relationship Commitment"] = qScores["Connection"];

  qScores["Career Focus"] = qScores["Growth"];
  qScores["Personal Growth"] = qScores["Growth"];

  qScores["Emotional Wellbeing"] = qScores["Stability"];
  qScores["Communication Style"] = qScores["Stability"];

  qScores["Adventure & Travel"] = qScores["Exploration"];
  qScores["Health & Lifestyle"] = qScores["Exploration"];

  // 2. Fetch all journals for story analysis
  const journals = await db.select().from(dailyJournalsTable).where(eq(dailyJournalsTable.userId, userId));
  let sScores: Record<string, number> = {};

  for (const journal of journals) {
    if (journal.content) {
      sScores = analyzeStoryKeywords(journal.content, sScores).updatedScores;
    }
  }

  // 3. Combine scores
  const unifiedScores = calculateUnifiedScores(qScores, sScores);
  const summary = generateProfileInsights(unifiedScores);
  const legacyTraits = convertUnifiedToLegacyTraits(unifiedScores);

  const connectionTrait = legacyTraits.find((t: any) => t.trait === "Connection")?.score || 0;
  const stabilityTrait = legacyTraits.find((t: any) => t.trait === "Stability")?.score || 0;
  const growthTrait = legacyTraits.find((t: any) => t.trait === "Growth")?.score || 0;
  const explorationTrait = legacyTraits.find((t: any) => t.trait === "Exploration")?.score || 0;
  const overallScore = Math.max(connectionTrait, stabilityTrait, growthTrait, explorationTrait);

  console.log(`\n========================================`);
  console.log(`=== PERSONALITY CALCULATION DEBUG (User ${userId}) ===`);
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.options) {
      const answerStr = String(answer.answer);
      const optionIndex = question.options.findIndex((opt: string) => opt === answerStr || opt.startsWith(answerStr.charAt(0)));
      if (optionIndex !== -1) {
        const optionLetter = ['A', 'B', 'C', 'D'][optionIndex] || 'A';
        const traitName = optionLetter === 'A' ? 'Connection' : optionLetter === 'B' ? 'Growth' : optionLetter === 'C' ? 'Stability' : 'Exploration';
        console.log(`Question ${i + 1} → Option ${optionLetter} → ${traitName} +10`);
      }
    }
  }

  console.log(`\nRaw Trait Scores:`);
  console.log(`Connection = ${qScores["Connection"]}`);
  console.log(`Growth = ${qScores["Growth"]}`);
  console.log(`Stability = ${qScores["Stability"]}`);
  console.log(`Exploration = ${qScores["Exploration"]}`);

  console.log(`\nFinal Percentages:`);
  console.log(`Connection = ${connectionTrait}%`);
  console.log(`Growth = ${growthTrait}%`);
  console.log(`Stability = ${stabilityTrait}%`);
  console.log(`Exploration = ${explorationTrait}%`);
  console.log(`Overall = ${overallScore}%`);
  console.log(`========================================\n`);

  let dominantType = "Balanced";
  let maxScore = -1;
  for (const cat of UNIFIED_CATEGORIES) {
    if ((unifiedScores[cat] || 0) > maxScore) {
       maxScore = unifiedScores[cat];
       dominantType = cat;
    }
  }

  // 4. INJECT Legacy Traits directly into qScores so the engine reads them correctly!
  if (connectionTrait !== undefined) qScores["Connection"] = connectionTrait;
  if (stabilityTrait !== undefined) qScores["Stability"] = stabilityTrait;
  if (growthTrait !== undefined) qScores["Growth"] = growthTrait;
  if (explorationTrait !== undefined) qScores["Exploration"] = explorationTrait;

  // 5. Save to DB
  let profile = await db.query.personalityProfilesTable.findFirst({
    where: eq(personalityProfilesTable.userId, userId)
  });

  if (profile) {
    await db.update(personalityProfilesTable).set({
      questionnaireCategoryScores: JSON.stringify(qScores),
      storyCategoryScores: JSON.stringify(sScores),
      finalUnifiedCategoryScores: JSON.stringify(unifiedScores),
      traits: JSON.stringify(legacyTraits),
      dominantType,
      summary,
      generatedAt: new Date()
    }).where(eq(personalityProfilesTable.id, profile.id));
  } else {
    // Need to handle case where no answers but generation is forced. 
    // It creates a zeroed profile.
    await db.insert(personalityProfilesTable).values({
      userId: userId,
      questionnaireCategoryScores: JSON.stringify(qScores),
      storyCategoryScores: JSON.stringify(sScores),
      finalUnifiedCategoryScores: JSON.stringify(unifiedScores),
      traits: JSON.stringify(legacyTraits),
      dominantType,
      summary,
      generatedAt: new Date()
    });
  }

  // Fetch and return the updated profile for immediate use
  profile = await db.query.personalityProfilesTable.findFirst({
    where: eq(personalityProfilesTable.userId, userId)
  });

  return profile;
}
