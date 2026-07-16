
import { db, personalityProfilesTable } from "@workspace/db";
import { calculateUnifiedScores, convertUnifiedToLegacyTraits, generateProfileInsights, UNIFIED_CATEGORIES } from "./src/services/keywordAnalysis.js";

async function run() {
  const profiles = await db.select().from(personalityProfilesTable);
  for (const profile of profiles) {
    let qScores = {};
    let sScores = {};
    if (profile.questionnaireCategoryScores) {
      try { qScores = JSON.parse(profile.questionnaireCategoryScores); } catch(e) {}
    }
    if (profile.storyCategoryScores) {
      try { sScores = JSON.parse(profile.storyCategoryScores); } catch(e) {}
    }

    const unifiedScores = calculateUnifiedScores(qScores, sScores);
    const summary = generateProfileInsights(unifiedScores);
    
    let dominantType = "Balanced";
    let maxScore = -1;
    for (const cat of UNIFIED_CATEGORIES) {
      if ((unifiedScores[cat] || 0) > maxScore) {
         maxScore = unifiedScores[cat];
         dominantType = cat;
      }
    }

    await db.update(personalityProfilesTable).set({
      finalUnifiedCategoryScores: JSON.stringify(unifiedScores),
      dominantType,
      summary,
      generatedAt: new Date()
    });
    console.log(`Updated profile for user ${profile.userId}`);
  }
  process.exit(0);
}
run();
