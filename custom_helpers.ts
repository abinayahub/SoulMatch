import { db } from "@workspace/db";
import { compatibilityScoresTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import { generateFullUserProfile } from "./artifacts/api-server/src/services/profileGenerator";

/**
 * Compatibility Engine
 *
 * Performs a strict validation pipeline before calculating similarity.
 * Returns detailed scores when both users have complete analysis, otherwise a
 * friendly message explaining why the comparison cannot be performed.
 */
export async function calculateAndStoreCompatibility(
  currentUserProfile: any,
  targetUserProfile: any,
  currentUserId: number,
  targetUserId: number
) {
  // ---------------------------------------------------------------
  // Step 0 – Ensure we are not comparing the same user
  // ---------------------------------------------------------------
  console.log("[Compatibility Engine] Viewer User ID:", currentUserId);
  console.log("[Compatibility Engine] Matched User ID:", targetUserId);
  if (currentUserId === targetUserId) {
    console.warn("[Compatibility Engine] Self‑comparison attempted – aborting.");
    return { available: false, message: "Cannot compare a user with themselves." };
  }

  // ---------------------------------------------------------------
  // Step 1 & 2 – Verify logged-in user and matched user have full analysis
  // ---------------------------------------------------------------
  let viewerHasAll = currentUserProfile?.questionnaireCategoryScores && currentUserProfile?.storyCategoryScores;
  if (!viewerHasAll) {
    console.warn(`[Compatibility Engine] Viewer (${currentUserId}) missing analysis – auto-generating...`);
    currentUserProfile = await generateFullUserProfile(currentUserId);
    viewerHasAll = currentUserProfile?.questionnaireCategoryScores && currentUserProfile?.storyCategoryScores;
    viewerGenerated = true;
  }

  let matchedHasAll = targetUserProfile?.questionnaireCategoryScores && targetUserProfile?.storyCategoryScores;
  if (!matchedHasAll) {
    console.warn(`[Compatibility Engine] Matched user (${targetUserId}) missing analysis – auto-generating...`);
    targetUserProfile = await generateFullUserProfile(targetUserId);
    matchedHasAll = targetUserProfile?.questionnaireCategoryScores && targetUserProfile?.storyCategoryScores;
    targetGenerated = true;
  }

  if (!viewerHasAll) {
    console.warn(`[Compatibility Engine] Viewer (${currentUserId}) failed to generate full analysis – aborting.`);
    return {
      available: false,
      message: "Compatibility analysis unavailable because the logged-in user has not completed the 30-Day Journey or lacks analysis."
    };
  }

  if (!matchedHasAll) {
    console.warn(`[Compatibility Engine] Matched user (${targetUserId}) failed to generate full analysis – aborting.`);
    return {
      available: false,
      message: "Compatibility analysis unavailable because this user has not completed enough personality questions or stories."
    };
  }

  // ---------------------------------------------------------------
  // Parse JSON payloads
  // ---------------------------------------------------------------
  let viewerQ = JSON.parse(currentUserProfile.questionnaireCategoryScores) as any;
  let viewerS = JSON.parse(currentUserProfile.storyCategoryScores) as any;
  let targetQ = JSON.parse(targetUserProfile.questionnaireCategoryScores) as any;
  let targetS = JSON.parse(targetUserProfile.storyCategoryScores) as any;

  // ---------------------------------------------------------------
  // Step 5 & 6 – Detect zero-filled personality profiles (generation failure)
  // ---------------------------------------------------------------
  const isZeroed = (q: any) => (q.Connection || 0) === 0 && (q.Stability || 0) === 0 && (q.Growth || 0) === 0 && (q.Exploration || 0) === 0;

  if (isZeroed(viewerQ)) {
    console.warn(`[Compatibility Engine] Viewer (${currentUserId}) personality is zeroed – forcing regeneration...`);
    currentUserProfile = await generateFullUserProfile(currentUserId);
    viewerQ = JSON.parse(currentUserProfile?.questionnaireCategoryScores || "{}");
    viewerGenerated = true;
  }

  if (isZeroed(targetQ)) {
    console.warn(`[Compatibility Engine] Matched user (${targetUserId}) personality is zeroed – forcing regeneration...`);
    targetUserProfile = await generateFullUserProfile(targetUserId);
    targetQ = JSON.parse(targetUserProfile?.questionnaireCategoryScores || "{}");
    targetGenerated = true;
  }

  if (isZeroed(viewerQ) || isZeroed(targetQ)) {
    console.warn("[Compatibility Engine] Still zeroed after regeneration – treating as generation failure (user hasn't answered questions).");
    return { available: false, message: "Personality analysis unavailable because one profile is empty (0%)." };
  }

  const storyKeys = Object.keys(viewerS);
  const storyAllZero =
    storyKeys.length > 0 &&
    storyKeys.every((k) => (viewerS[k] || 0) === 0 && (targetS[k] || 0) === 0);
  if (storyAllZero) {
    console.warn("[Compatibility Engine] Zeroed story profiles – aborting.");
    return { available: false, message: "Story analysis unavailable because one profile lacks story data." };
  }

  // ---------------------------------------------------------------
  // Helper: dump analysis data for debugging
  // ---------------------------------------------------------------
  const dumpDebugInfo = (role: string, userId: number, profile: any, generatedJustNow: boolean) => {
    const hasQuestionnaire = !!profile?.questionnaireCategoryScores;
    const hasStory = !!profile?.storyCategoryScores;
    console.log(`\n========================`);
    console.log(`${role.toUpperCase()}`);
    console.log(`User ID: ${userId}`);
    console.log(`Journey Status`);
    console.log(`30-Day Journey Completed?: ${hasQuestionnaire && hasStory}`);
    console.log(`Personality Analysis Exists?: ${hasQuestionnaire}`);
    console.log(`Story Analysis Exists?: ${hasStory}`);
    
    let q: any = {};
    let s: any = {};
    try {
      q = JSON.parse(profile?.questionnaireCategoryScores || "{}");
      s = JSON.parse(profile?.storyCategoryScores || "{}");
    } catch(e) {}

    const printField = (name: string, val: any, sourcePrefix: string) => {
      console.log(`${name}: ${val ?? null}`);
      let source = "NULL";
      if (val !== undefined && val !== null) {
        if (generatedJustNow) source = "Calculated on demand";
        else source = `${sourcePrefix} table`;
      }
      console.log(`Source: ${source}`);
    };

    printField("Connection", q.Connection, "personality_profiles (questionnaireCategoryScores)");
    printField("Stability", q.Stability, "personality_profiles (questionnaireCategoryScores)");
    printField("Growth", q.Growth, "personality_profiles (questionnaireCategoryScores)");
    printField("Exploration", q.Exploration, "personality_profiles (questionnaireCategoryScores)");
    
    printField("Family Values", s["Family Values"], "personality_profiles (storyCategoryScores)");
    printField("Career Focus", s["Career Focus"], "personality_profiles (storyCategoryScores)");
    printField("Personal Growth", s["Personal Growth"], "personality_profiles (storyCategoryScores)");
    printField("Health & Lifestyle", s["Health & Lifestyle"], "personality_profiles (storyCategoryScores)");
    printField("Social Engagement", s["Social Engagement"], "personality_profiles (storyCategoryScores)");
    printField("Adventure", s["Adventure & Travel"], "personality_profiles (storyCategoryScores)");
    console.log(`========================\n`);
  };

  let viewerGenerated = false;
  let targetGenerated = false;

  dumpDebugInfo("Viewer", currentUserId, currentUserProfile, viewerGenerated);
  dumpDebugInfo("Matched", targetUserId, targetUserProfile, targetGenerated);

  // ---------------------------------------------------------------
  // Similarity helper (direct calculation, never stored)
  // ---------------------------------------------------------------
  const similarity = (a: number, b: number) => Math.max(0, 100 - Math.abs(a - b));

  // ---------------------------------------------------------------
  // Step 3 – Calculate personality similarity
  // ---------------------------------------------------------------
  const connectionSim = similarity(viewerQ.Connection || 0, targetQ.Connection || 0);
  const stabilitySim = similarity(viewerQ.Stability || 0, targetQ.Stability || 0);
  const growthSim = similarity(viewerQ.Growth || 0, targetQ.Growth || 0);
  const explorationSim = similarity(viewerQ.Exploration || 0, targetQ.Exploration || 0);

  const personalityScore = Math.round(
    connectionSim * 0.3 +
      stabilitySim * 0.3 +
      growthSim * 0.2 +
      explorationSim * 0.2
  );

  // ---------------------------------------------------------------
  // Step 3 – Calculate story similarity (average over all present keys)
  // ---------------------------------------------------------------
  let storySum = 0;
  const storySim: Record<string, number> = {};
  for (const key of storyKeys) {
    const sim = similarity(viewerS[key] || 0, targetS[key] || 0);
    storySim[key] = sim;
    storySum += sim;
  }
  const storyScore = storyKeys.length ? Math.round(storySum / storyKeys.length) : 0;

  // ---------------------------------------------------------------
  // Overall compatibility (60% personality, 40% story)
  // ---------------------------------------------------------------
  const overallScore = Math.round(personalityScore * 0.6 + storyScore * 0.4);

  // ---------------------------------------------------------------
  // Persist the result (only raw score & breakdown are saved)
  // ---------------------------------------------------------------
  const existing = await db.query.compatibilityScoresTable.findFirst({
    where: or(
      and(eq(compatibilityScoresTable.userAId, currentUserId), eq(compatibilityScoresTable.userBId, targetUserId)),
      and(eq(compatibilityScoresTable.userAId, targetUserId), eq(compatibilityScoresTable.userBId, currentUserId))
    ),
  });

  const payload = {
    score: overallScore,
    breakdown: JSON.stringify({
      personality: {
        Connection: connectionSim,
        Stability: stabilitySim,
        Growth: growthSim,
        Exploration: explorationSim,
      },
      story: storySim,
    }),
    summary: `Compatibility ${overallScore}%`,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(compatibilityScoresTable).set(payload).where(eq(compatibilityScoresTable.id, existing.id));
  } else {
    await db.insert(compatibilityScoresTable).values({
      userAId: currentUserId,
      userBId: targetUserId,
      ...payload,
      createdAt: new Date(),
    });
  }

  // ---------------------------------------------------------------
  // Return the freshly calculated data
  // ---------------------------------------------------------------
  return {
    available: true,
    compatibilityScore: overallScore,
    personalityScore,
    storyScore,
    perCategory: {
      personality: {
        Connection: connectionSim,
        Stability: stabilitySim,
        Growth: growthSim,
        Exploration: explorationSim,
      },
      story: storySim,
    },
    message: "Success",
  };
}
