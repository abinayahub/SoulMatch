import { db, journeyAnswersTable, journeyQuestionsTable, dailyJournalsTable, personalityProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { calculateUnifiedScores, generateProfileInsights, UNIFIED_CATEGORIES, convertUnifiedToLegacyTraits, analyzeStoryKeywords } from "./keywordAnalysis";

export async function generateFullUserProfile(userId: number) {
  // 1. Fetch all journey answers and questions
  const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, userId));
  const questions = await db.select().from(journeyQuestionsTable);

  const qScores: Record<string, number> = {};

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.options) {
      const answerStr = String(answer.answer);
      const optionIndex = question.options.findIndex((opt: string) => opt === answerStr || opt.startsWith(answerStr.charAt(0)));
      
      if (optionIndex !== -1) {
        let optionLetter = 'A';
        if (optionIndex === 1) optionLetter = 'B';
        if (optionIndex === 2) optionLetter = 'C';
        if (optionIndex === 3) optionLetter = 'D';

        const category = question.category;
        const pointsToAdd: Record<string, number> = {};

        // Unified Master Category Mapping
        if (category === "Personality" || category === "Lifestyle") {
          if (optionLetter === 'A') { pointsToAdd["Family Values"] = 2; pointsToAdd["Social Engagement"] = 2; pointsToAdd["Kindness & Empathy"] = 1; }
          else if (optionLetter === 'B') { pointsToAdd["Career Focus"] = 3; pointsToAdd["Personal Growth"] = 2; }
          else if (optionLetter === 'C') { pointsToAdd["Emotional Wellbeing"] = 3; pointsToAdd["Relationship Commitment"] = 2; }
          else if (optionLetter === 'D') { pointsToAdd["Adventure & Travel"] = 3; pointsToAdd["Health & Lifestyle"] = 1; }
        } else if (category === "Family Values") {
          if (optionLetter === 'A') { pointsToAdd["Family Values"] = 3; pointsToAdd["Kindness & Empathy"] = 2; }
          else if (optionLetter === 'B') { pointsToAdd["Personal Growth"] = 3; pointsToAdd["Communication Style"] = 1; }
          else if (optionLetter === 'C') { pointsToAdd["Relationship Commitment"] = 3; pointsToAdd["Family Values"] = 1; }
          else if (optionLetter === 'D') { pointsToAdd["Health & Lifestyle"] = 2; pointsToAdd["Adventure & Travel"] = 1; }
        } else if (category === "Career Goals" || category === "Career") {
          if (optionLetter === 'A') { pointsToAdd["Social Engagement"] = 2; pointsToAdd["Kindness & Empathy"] = 2; }
          else if (optionLetter === 'B') { pointsToAdd["Career Focus"] = 4; pointsToAdd["Personal Growth"] = 1; }
          else if (optionLetter === 'C') { pointsToAdd["Emotional Wellbeing"] = 2; pointsToAdd["Relationship Commitment"] = 1; }
          else if (optionLetter === 'D') { pointsToAdd["Personal Growth"] = 3; pointsToAdd["Adventure & Travel"] = 1; }
        } else if (category === "Communication Style" || category === "Communication") {
          if (optionLetter === 'A') { pointsToAdd["Communication Style"] = 3; pointsToAdd["Kindness & Empathy"] = 2; }
          else if (optionLetter === 'B') { pointsToAdd["Communication Style"] = 2; pointsToAdd["Health & Lifestyle"] = 2; }
          else if (optionLetter === 'C') { pointsToAdd["Emotional Wellbeing"] = 3; pointsToAdd["Communication Style"] = 1; }
          else if (optionLetter === 'D') { pointsToAdd["Personal Growth"] = 2; pointsToAdd["Social Engagement"] = 1; }
        } else if (category === "Relationship Goals" || category === "Relationship") {
          if (optionLetter === 'A') { pointsToAdd["Relationship Commitment"] = 3; pointsToAdd["Emotional Wellbeing"] = 2; }
          else if (optionLetter === 'B') { pointsToAdd["Personal Growth"] = 3; pointsToAdd["Career Focus"] = 1; }
          else if (optionLetter === 'C') { pointsToAdd["Relationship Commitment"] = 4; pointsToAdd["Family Values"] = 1; }
          else if (optionLetter === 'D') { pointsToAdd["Adventure & Travel"] = 3; pointsToAdd["Social Engagement"] = 1; }
        } else {
          // Fallback
          if (optionLetter === 'A') { pointsToAdd["Social Engagement"] = 2; }
          else if (optionLetter === 'B') { pointsToAdd["Personal Growth"] = 2; }
          else if (optionLetter === 'C') { pointsToAdd["Emotional Wellbeing"] = 2; }
          else if (optionLetter === 'D') { pointsToAdd["Adventure & Travel"] = 2; }
        }

        for (const [cat, pts] of Object.entries(pointsToAdd)) {
          qScores[cat] = (qScores[cat] || 0) + pts;
        }
      }
    }
  }

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
  
  let dominantType = "Balanced";
  let maxScore = -1;
  for (const cat of UNIFIED_CATEGORIES) {
    if ((unifiedScores[cat] || 0) > maxScore) {
       maxScore = unifiedScores[cat];
       dominantType = cat;
    }
  }

  // 4. INJECT Legacy Traits directly into qScores so the engine reads them correctly!
  const connectionTrait = legacyTraits.find((t: any) => t.trait === "Connection");
  const stabilityTrait = legacyTraits.find((t: any) => t.trait === "Stability");
  const growthTrait = legacyTraits.find((t: any) => t.trait === "Growth");
  const explorationTrait = legacyTraits.find((t: any) => t.trait === "Exploration");

  if (connectionTrait) qScores["Connection"] = connectionTrait.score;
  if (stabilityTrait) qScores["Stability"] = stabilityTrait.score;
  if (growthTrait) qScores["Growth"] = growthTrait.score;
  if (explorationTrait) qScores["Exploration"] = explorationTrait.score;

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
