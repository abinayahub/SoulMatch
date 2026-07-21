import { db } from "@workspace/db";
import { usersTable, photosTable, compatibilityScoresTable, personalityProfilesTable, dailyJournalsTable, dailyReflectionsTable, journeyAnswersTable } from "@workspace/db";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { calculateSoulMatchCompatibility, generateDeterministicMatchInsights, calculateDetailedInsights } from "../services/keywordAnalysis";

export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export async function buildPublicProfile(userId: number, viewerUserId?: number) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });
  if (!user) return null;

  const photos = await db.select().from(photosTable).where(eq(photosTable.userId, userId));

  let isMutualMatch = false;
  let hasPendingInterest = false;
  let interestSentByViewer = false;
  let pendingInterestId = null;

  if (viewerUserId && viewerUserId !== userId) {
    const { interestsTable } = await import("@workspace/db");
    const interests = await db.select().from(interestsTable).where(
      or(
        and(eq(interestsTable.fromUserId, viewerUserId), eq(interestsTable.toUserId, userId)),
        and(eq(interestsTable.fromUserId, userId), eq(interestsTable.toUserId, viewerUserId))
      )
    );

    for (const interest of interests) {
      if (interest.status === "accepted") isMutualMatch = true;
      if (interest.status === "pending") {
        hasPendingInterest = true;
        pendingInterestId = interest.id;
        if (interest.fromUserId === viewerUserId) interestSentByViewer = true;
      }
    }
  }

  const isFullyVisible = isMutualMatch || viewerUserId === userId;
  let compatibilityScore = null;
  let personalityMatch = null;
  let behavioralMatch = null;
  let aiStoryMatch = null;
  let aiSummary = null;
  let finalUnifiedCategoryScores = null;
  let summary = null;
  let traits: string[] = [];

  const targetProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, userId) });
  if (targetProfile) {
    finalUnifiedCategoryScores = targetProfile.finalUnifiedCategoryScores ? JSON.parse(targetProfile.finalUnifiedCategoryScores) : null;
    summary = targetProfile.summary;
    if (targetProfile.traits) {
      try { 
        const parsed = JSON.parse(targetProfile.traits); 
        traits = Array.isArray(parsed) ? parsed : [parsed];
      } catch(e) {
        traits = [targetProfile.traits];
      }
    }
  }

  const stories = await db.select().from(dailyJournalsTable).where(eq(dailyJournalsTable.userId, userId));
  const storyCount = stories.length;

  if (viewerUserId && viewerUserId !== userId) {
    const viewerProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, viewerUserId) });
    if (viewerProfile && targetProfile) {
      const result = await calculateAndStoreCompatibility(viewerProfile, targetProfile, viewerUserId, userId);
      compatibilityScore = result.compatibilityScore;
      personalityMatch = result.personalityMatch;
      behavioralMatch = (result as any).behavioralMatch;
      aiStoryMatch = result.aiStoryMatch;
      aiSummary = result.aiSummary;
    }
  }

  return {
    id: user.id,
    firstName: user.firstName,
    displayName: user.displayName,
    age: calculateAge(user.dateOfBirth),
    occupation: isFullyVisible ? user.occupation : null,
    education: isFullyVisible ? user.education : null,
    city: user.city,
    country: user.country,
    religion: isFullyVisible ? user.religion : null,
    bio: isFullyVisible ? user.bio : "This user's bio is hidden. Connect to see their full profile!",
    photos: isFullyVisible
      ? photos.map((p: any) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId }))
      : photos.slice(0, 1).map((p: any) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
    verificationStatus: user.verificationStatus,
    isPremium: user.role === "premium" || user.role === "admin" || user.role === "superadmin",
    compatibilityScore,
    personalityMatch,
    behavioralMatch,
    aiStoryMatch,
    aiSummary,
    journeyProgress: user.journeyProgress,
    isMutualMatch,
    hasPendingInterest,
    interestSentByViewer,
    pendingInterestId,
    summary,
    finalUnifiedCategoryScores,
    storyCount,
    traits,
    recentStories: stories
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(s => ({
        id: s.id,
        content: s.content,
        imageUrl: s.imageUrl,
        createdAt: s.createdAt
      }))
  };
}

export async function calculateAndStoreCompatibility(currentUserProfile: any, targetUserProfile: any, currentUserId: number, targetUserId: number) {
  try {
    const { generateFullUserProfile } = await import("../services/profileGenerator");

    let viewerHasAll = currentUserProfile?.questionnaireCategoryScores && currentUserProfile?.storyCategoryScores;
    if (!viewerHasAll) {
      console.warn(`[Compatibility Engine] Viewer (${currentUserId}) missing analysis – auto-generating...`);
      currentUserProfile = await generateFullUserProfile(currentUserId);
      viewerHasAll = currentUserProfile?.questionnaireCategoryScores && currentUserProfile?.storyCategoryScores;
    }

    let matchedHasAll = targetUserProfile?.questionnaireCategoryScores && targetUserProfile?.storyCategoryScores;
    if (!matchedHasAll) {
      console.warn(`[Compatibility Engine] Matched user (${targetUserId}) missing analysis – auto-generating...`);
      targetUserProfile = await generateFullUserProfile(targetUserId);
      matchedHasAll = targetUserProfile?.questionnaireCategoryScores && targetUserProfile?.storyCategoryScores;
    }

    if (!viewerHasAll || !matchedHasAll) {
      return {
        compatibilityScore: 0, personalityMatch: 0, aiStoryMatch: 0,
        summary: "Compatibility analysis unavailable because one or both users have not completed enough questions or stories.",
        traitBreakdowns: [], storyBreakdowns: [], whyYouMatch: [], areasToExplore: []
      };
    }

    let qScoresA = currentUserProfile?.questionnaireCategoryScores ? JSON.parse(currentUserProfile.questionnaireCategoryScores) : {};
    let qScoresB = targetUserProfile?.questionnaireCategoryScores ? JSON.parse(targetUserProfile.questionnaireCategoryScores) : {};
    const sScoresA = currentUserProfile?.storyCategoryScores ? JSON.parse(currentUserProfile.storyCategoryScores) : {};
    const sScoresB = targetUserProfile?.storyCategoryScores ? JSON.parse(targetUserProfile.storyCategoryScores) : {};

    const isZeroed = (q: any) => (q.Connection || 0) === 0 && (q.Stability || 0) === 0 && (q.Growth || 0) === 0 && (q.Exploration || 0) === 0;

    if (isZeroed(qScoresA)) {
      console.warn(`[Compatibility Engine] Viewer (${currentUserId}) personality is zeroed – forcing regeneration...`);
      currentUserProfile = await generateFullUserProfile(currentUserId);
      qScoresA = JSON.parse(currentUserProfile?.questionnaireCategoryScores || "{}");
    }

    if (isZeroed(qScoresB)) {
      console.warn(`[Compatibility Engine] Matched user (${targetUserId}) personality is zeroed – forcing regeneration...`);
      targetUserProfile = await generateFullUserProfile(targetUserId);
      qScoresB = JSON.parse(targetUserProfile?.questionnaireCategoryScores || "{}");
    }

    if (isZeroed(qScoresA) || isZeroed(qScoresB)) {
      return {
        compatibilityScore: 0, personalityMatch: 0, aiStoryMatch: 0,
        summary: "Personality analysis unavailable because one profile is empty (0%).",
        traitBreakdowns: [], storyBreakdowns: [], whyYouMatch: [], areasToExplore: []
      };
    }

    const cached = await db.query.compatibilityScoresTable.findFirst({
      where: or(
        and(
          eq(compatibilityScoresTable.userAId, currentUserId),
          eq(compatibilityScoresTable.userBId, targetUserId),
        ),
        and(
          eq(compatibilityScoresTable.userAId, targetUserId),
          eq(compatibilityScoresTable.userBId, currentUserId),
        ),
      ),
    });

    const [userA, userB, reflectionsA, reflectionsB, answersA, answersB] = await Promise.all([
      db.query.usersTable.findFirst({ where: eq(usersTable.id, currentUserId) }),
      db.query.usersTable.findFirst({ where: eq(usersTable.id, targetUserId) }),
      db.select().from(dailyReflectionsTable).where(eq(dailyReflectionsTable.userId, currentUserId)),
      db.select().from(dailyReflectionsTable).where(eq(dailyReflectionsTable.userId, targetUserId)),
      db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, currentUserId)),
      db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, targetUserId))
    ]);

    const { pMatch, sMatch, finalScore, hasStories, traitBreakdowns, storyBreakdowns, whyYouMatch, areasToExplore, aiSummary, sConfidenceData, pConfidence } = calculateSoulMatchCompatibility(qScoresA, qScoresB, sScoresA, sScoresB, userA, userB, reflectionsA, reflectionsB, answersA, answersB);

    const compatibilityScore = finalScore;
    
    let band = "Low Match";
    if (compatibilityScore >= 95) band = "Exceptional Match";
    else if (compatibilityScore >= 90) band = "Excellent Match";
    else if (compatibilityScore >= 80) band = "Strong Match";
    else if (compatibilityScore >= 70) band = "Good Match";
    else if (compatibilityScore >= 60) band = "Moderate Match";

    const summary = `You have a ${band} with a score of ${compatibilityScore}%.`;

    // Upsert the cache — always overwrite so stale scores from old buggy engine are corrected
    try {
      if (cached) {
        await db.update(compatibilityScoresTable)
          .set({ score: compatibilityScore })
          .where(
            or(
              and(
                eq(compatibilityScoresTable.userAId, currentUserId),
                eq(compatibilityScoresTable.userBId, targetUserId),
              ),
              and(
                eq(compatibilityScoresTable.userAId, targetUserId),
                eq(compatibilityScoresTable.userBId, currentUserId),
              ),
            )
          );
      } else {
        await db.insert(compatibilityScoresTable).values({
          userAId: currentUserId,
          userBId: targetUserId,
          score: compatibilityScore,
        });
      }
    } catch (e) {
      console.error("Error upserting compatibility score cache", e);
    }

    return {
      compatibilityScore,
      personalityMatch: pMatch,
      aiStoryMatch: sMatch,
      summary,
      traitBreakdowns,
      storyBreakdowns,
      whyYouMatch,
      areasToExplore,
      aiSummary,
      sConfidenceData,
      pConfidence,
      hasStories
    };
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return {
      compatibilityScore: 50,
      personalityMatch: 50,
      aiStoryMatch: 50,
      summary: "We are still analyzing your compatibility.",
      traitBreakdowns: [],
      storyBreakdowns: [],
      whyYouMatch: [],
      areasToExplore: []
    };
  }
}

export async function buildUserProfile(user: any) {
  const photos = await db.select().from(photosTable).where(eq(photosTable.userId, user.id));
  const [journalCountResult] = await db.select({ count: sql<number>`count(*)` }).from(dailyJournalsTable).where(eq(dailyJournalsTable.userId, user.id));
  return {
    ...user,
    age: calculateAge(user.dateOfBirth),
    photos: photos.map((p: any) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
    profileCompleteness: calculateProfileCompleteness(user, photos),
    journalCount: Number(journalCountResult?.count || 0),
    isPremium: user.role === "premium" || user.role === "admin" || user.role === "superadmin"
  };
}

export function calculateProfileCompleteness(user: any, photos: any[] = []) {
  // Use the exact same 9 fields as the frontend's MANDATORY_FIELDS to ensure a single source of truth
  const fields = [
    "firstName", "dateOfBirth", "gender", "maritalStatus", 
    "height", "bio", "education", "occupation", "country"
  ];
  const filled = fields.filter(f => user[f] != null && user[f] !== "" && (!Array.isArray(user[f]) || user[f].length > 0)).length;
  const score = (filled / fields.length) * 100;
  return Math.min(100, Math.round(score));
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Safely parse the `interests` column which may arrive as:
 *  - a real JS string[]  (Postgres text[] via Drizzle)
 *  - a JSON string       (e.g. '["hiking","cooking"]')
 *  - null / undefined
 * Returns a normalised string[].
 */
export function parseInterests(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    // Already a real array — filter to strings only
    return val.filter((v) => typeof v === "string");
  }
  if (typeof val === "string") {
    // Try JSON parse first
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === "string");
    } catch (_) { /* not JSON */ }
    // Comma-separated fallback
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
