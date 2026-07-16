// @ts-nocheck
import { analyzeStoryKeywords, calculateUnifiedScores, calculateStoryCompatibility, generateDeterministicConversationStarters, generateDeterministicMatchInsights, UNIFIED_CATEGORIES } from "./services/keywordAnalysis.js";

// User A
// Questionnaire: Family-oriented answers, Communication-focused answers
const qScoresA = {
  "Family Values": 20,
  "Communication Style": 15,
  "Kindness & Empathy": 10,
  "Social Engagement": 5,
};

// Stories: Spending time with parents, Helping family members, Meeting friends
const storyA = "I love spending time with my parents and grandparents. Helping my family members brings me peace. Meeting friends is always a joy.";
const sScoresA = analyzeStoryKeywords(storyA);

const finalA = calculateUnifiedScores(qScoresA, sScoresA);

console.log("=== USER A ===");
for (const cat of UNIFIED_CATEGORIES) {
  const q = qScoresA[cat] || 0;
  const s = sScoresA[cat] || 0;
  const f = finalA[cat] || 0;
  if (q > 0 || s > 0 || f > 0) {
    console.log(`${cat}`);
    console.log(`Questionnaire: ${q}`);
    console.log(`Story: ${s}`);
    console.log(`Final: ${f}`);
    console.log("---");
  }
}

// User B
// Questionnaire: Career-focused answers, Adventure-focused answers
const qScoresB = {
  "Career Focus": 25,
  "Adventure & Travel": 18,
  "Personal Growth": 12,
  "Decision Making": 8,
};

// Stories: Project work, Travel experiences, Learning new skills
const storyB = "Working hard on my career and latest business project to achieve success. I am learning new skills to grow. Looking forward to my next travel adventure and exploring the outdoors.";
const sScoresB = analyzeStoryKeywords(storyB);

const finalB = calculateUnifiedScores(qScoresB, sScoresB);

console.log("\n=== USER B ===");
for (const cat of UNIFIED_CATEGORIES) {
  const q = qScoresB[cat] || 0;
  const s = sScoresB[cat] || 0;
  const f = finalB[cat] || 0;
  if (q > 0 || s > 0 || f > 0) {
    console.log(`${cat}`);
    console.log(`Questionnaire: ${q}`);
    console.log(`Story: ${s}`);
    console.log(`Final: ${f}`);
    console.log("---");
  }
}

console.log("\n=== COMPATIBILITY VERIFICATION ===");
const compatibilityScore = calculateStoryCompatibility(finalA, finalB);
console.log(`Unified Value Match: ${compatibilityScore}%`);

const insights = generateDeterministicMatchInsights(finalA, finalB);

console.log("\nWhy You Match:");
insights.whyYouMatch.forEach(w => console.log(w));

console.log("\nPotential Differences:");
insights.potentialDifferences.forEach(d => console.log(d));
// @ts-nocheck
