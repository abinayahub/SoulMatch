import { db, journeyAnswersTable, journeyQuestionsTable, dailyJournalsTable, personalityProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { calculateUnifiedScores, generateProfileInsights, UNIFIED_CATEGORIES, convertUnifiedToLegacyTraits, analyzeStoryKeywords } from "./keywordAnalysis";
import fs from "fs";
import path from "path";

// Load dynamic N-dimensional Journey config
const journeyConfigPath = path.join(__dirname, "journeyConfig.json");
let journeyConfig: any = null;
try {
  journeyConfig = JSON.parse(fs.readFileSync(journeyConfigPath, "utf-8"));
} catch (e) {
  console.error("Failed to load journeyConfig.json", e);
}

export async function generateFullUserProfile(userId: number) {
  // 1. Fetch all journey answers and questions
  const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, userId));
  const questions = await db.select().from(journeyQuestionsTable);

  const dimensions: string[] = journeyConfig?.dimensions || ["Connection", "Growth", "Stability", "Exploration"];
  const qScores: Record<string, number> = {};
  dimensions.forEach(dim => qScores[dim] = 0);

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.options) {
      const qId = String(question.id);
      const questionConfig = journeyConfig?.questions?.[qId] || {};
      const weight = questionConfig.weight ?? journeyConfig?.defaultWeight ?? 1.0;

      const answerStr = String(answer.answer);
      const optionIndex = question.options.findIndex((opt: string) => opt === answerStr || opt.startsWith(answerStr.charAt(0)));
      
      if (optionIndex !== -1) {
        const optionLetter = ['A', 'B', 'C', 'D'][optionIndex] || 'A';
        const impact = questionConfig.options?.[optionLetter] ?? journeyConfig?.defaultOptions?.[optionLetter];
        
        if (impact) {
          for (const [trait, points] of Object.entries(impact)) {
            if (qScores[trait] !== undefined) {
              qScores[trait] += (Number(points) * weight);
            }
          }
        }
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

  for (const cat of UNIFIED_CATEGORIES) {
    if (qScores[cat] === undefined) {
      qScores[cat] = 0;
    }
  }

  // 3. Independent Journey Profile
  const unifiedScores = { ...qScores };
  let rawSummary = generateProfileInsights(unifiedScores);
  const legacyTraits = convertUnifiedToLegacyTraits(unifiedScores);
  
  // Inject Journey Metadata
  let summary = rawSummary;
  try {
    let summaryData = typeof rawSummary === "string" ? JSON.parse(rawSummary) : rawSummary;
    if (typeof summaryData !== "object" || summaryData === null) summaryData = { text: rawSummary };

    const totalQuestions = journeyConfig?.totalQuestions ?? 150;
    const maturity = Math.min(1.0, answers.length / totalQuestions);
    
    summaryData.journeyMetadata = {
      journeyProgress: answers.length,
      totalJourneyQuestions: totalQuestions,
      journeyMaturity: maturity,
      profileConfidence: maturity >= 0.66 ? "High" : maturity >= 0.33 ? "Medium" : "Low",
      analysisStatus: maturity >= 1.0 ? "Complete" : "Learning"
    };

    summary = JSON.stringify(summaryData);
  } catch(e) {
    console.error("Failed to inject metadata into summary JSON", e);
  }

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
        const qId = String(question.id);
        const questionConfig = journeyConfig?.questions?.[qId] || {};
        const weight = questionConfig.weight ?? journeyConfig?.defaultWeight ?? 1.0;
        console.log(`Question ${question.id} (x${weight}) → Option ${optionLetter} applied to matrix`);
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
