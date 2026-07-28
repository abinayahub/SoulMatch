import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, photosTable, blockedUsersTable, personalityProfilesTable, interestsTable, compatibilityScoresTable, dailyJournalsTable } from "@workspace/db";
import { ne, eq, not, inArray, and, or, gt } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { buildPublicProfile, calculateAge, calculateAndStoreCompatibility, parseInterests } from "../lib/helpers";
import { extractStoryInterests } from "../services/keywordAnalysis";

const router = Router();

// TEMPORARY DB FIX ROUTE (Recompute)
router.get("/randomize-scores", async (req, res) => {
  try {
    const profiles = await db.select().from(personalityProfilesTable);
    for (const row of profiles) {
      let qScores = {};
      let sScores = {};
      try { if (row.questionnaireCategoryScores) qScores = JSON.parse(row.questionnaireCategoryScores); } catch(e) {}
      try { if (row.storyCategoryScores) sScores = JSON.parse(row.storyCategoryScores); } catch(e) {}

      const { calculateUnifiedScores, generateProfileInsights, convertUnifiedToLegacyTraits } = require("../services/keywordAnalysis");
      const unifiedScores = calculateUnifiedScores(qScores, sScores);
      const summary = generateProfileInsights(unifiedScores);
      const legacyTraits = convertUnifiedToLegacyTraits(unifiedScores);
      
      await db.update(personalityProfilesTable).set({
        finalUnifiedCategoryScores: JSON.stringify(unifiedScores),
        summary,
        traits: JSON.stringify(legacyTraits)
      }).where(eq(personalityProfilesTable.id, row.id));
    }
    await db.delete(compatibilityScoresTable);
    return res.json({ message: "Scores recomputed!" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: (e as any).message });
  }
});

const AI_INSIGHTS = [
  "You both value family deeply and share similar life goals.",
  "Your communication styles complement each other beautifully.",
  "Shared interests in culture and travel suggest great compatibility.",
  "Your emotional intelligence levels are closely aligned.",
  "Both value intellectual growth and meaningful conversation.",
  "Similar values around spirituality create a strong foundation.",
  "Your personalities balance each other in complementary ways.",
];

const COMMON_TRAITS = [
  ["family-oriented", "career-driven", "spiritual"],
  ["adventurous", "thoughtful", "empathetic"],
  ["intellectual", "creative", "grounded"],
  ["ambitious", "warm", "communicative"],
  ["traditional", "modern", "balanced"],
];

// GET /matches
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const currentUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const blocked = await db.select({ blockedId: blockedUsersTable.blockedId })
      .from(blockedUsersTable).where(eq(blockedUsersTable.blockerId, req.user!.userId));
    const blockedIds = blocked.map((b) => b.blockedId);

    const oppositeGender = currentUser.gender === "male" ? "female" : currentUser.gender === "female" ? "male" : null;

    const whereConditions: any[] = [
      ne(usersTable.id, req.user!.userId),
      gt(usersTable.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    ];
    if (oppositeGender) {
      whereConditions.push(eq(usersTable.gender, oppositeGender));
    }

    const allUsers = await db.select().from(usersTable)
      .where(and(...whereConditions));

    const filtered = allUsers
      .filter((u) => !blockedIds.includes(u.id));

    const photos = await db.select().from(photosTable);
    const photosByUser = new Map<number, typeof photos>();
    photos.forEach((p) => {
      if (!photosByUser.has(p.userId)) photosByUser.set(p.userId, []);
      photosByUser.get(p.userId)!.push(p);
    });

    const daysPassed = currentUser.journeyStartedAt 
      ? Math.floor((Date.now() - currentUser.journeyStartedAt.getTime()) / (1000 * 60 * 60 * 24)) 
      : 0;
    const isLocked = false;

    const currentUserProfile = await db.query.personalityProfilesTable.findFirst({
      where: eq(personalityProfilesTable.userId, currentUser.id)
    });
    let currentTraits: any[] = [];
    if (currentUserProfile?.traits) {
      try { currentTraits = JSON.parse(currentUserProfile.traits); } catch(e){}
    }

    const filteredIds = filtered.map(u => u.id);
    const otherProfiles = filteredIds.length > 0 ? await db.select().from(personalityProfilesTable).where(inArray(personalityProfilesTable.userId, filteredIds)) : [];
    const profileMap = new Map(otherProfiles.map(p => [p.userId, p]));

    // Fetch interests involving the current user and the filtered users
    const interests = filteredIds.length > 0 ? await db.select().from(interestsTable).where(
      and(
        or(
          eq(interestsTable.fromUserId, currentUser.id),
          eq(interestsTable.toUserId, currentUser.id)
        ),
        or(
          inArray(interestsTable.fromUserId, filteredIds),
          inArray(interestsTable.toUserId, filteredIds)
        )
      )
    ) : [];

    const matches = await Promise.all(filtered.map(async (u, i) => {
      let compatibilityScore = Math.floor(Math.random() * 20 + 75); // Fallback
      
      const interest = interests.find(int => 
        (int.fromUserId === currentUser.id && int.toUserId === u.id) ||
        (int.fromUserId === u.id && int.toUserId === currentUser.id)
      );
      
      const hasPendingInterest = interest?.status === "pending";
      const interestSentByViewer = interest?.fromUserId === currentUser.id;
      const isMutualMatch = interest?.status === "accepted";
      const targetProfile = profileMap.get(u.id);
      const result = await calculateAndStoreCompatibility(currentUserProfile, targetProfile, currentUser.id, u.id);
      compatibilityScore = result.compatibilityScore;
      console.log(`Discover Score for user ${u.id}:`, compatibilityScore);

      const currentUserInterests = parseInterests(currentUser.interests);
      const matchInterests = parseInterests(u.interests);
      const sharedInterests = currentUserInterests.filter((int: string) => matchInterests.includes(int));
      const commonInterestsCount = sharedInterests.length;

      let targetScores = {};
      if (targetProfile?.finalUnifiedCategoryScores) {
        try {
          const parsed = JSON.parse(targetProfile.finalUnifiedCategoryScores);
          if (parsed && typeof parsed === 'object') {
            targetScores = parsed;
          }
        } catch(e) {}
      }
      const sortedTraits = Object.entries(targetScores).sort((a: any, b: any) => b[1] - a[1]).filter((entry: any) => entry[1] > 0).map(e => e[0]);
      
      const traitMap: Record<string, string> = {
        "Adventure & Travel": "Adventurous",
        "Family Values": "Family-oriented",
        "Career Focus": "Driven",
        "Kindness & Empathy": "Compassionate",
        "Emotional Wellbeing": "Calm",
        "Relationship Commitment": "Loyal",
        "Communication Style": "Communicative",
        "Personal Growth": "Growth-oriented",
        "Social Engagement": "Outgoing",
        "Health & Lifestyle": "Active"
      };
      
      const commonTraits = sortedTraits.slice(0, 3).map(t => traitMap[t] || t as string);
      if (commonTraits.length === 0) commonTraits.push("Mysterious");

      const topInterest = sharedInterests.length > 0 ? sharedInterests[0] : "new activities";
      const topTrait = commonTraits[0] ? commonTraits[0].toLowerCase() : "values";
      const topValue = sortedTraits[0] || "meaningful connections";
      
      let aiInsight = "";
      if (compatibilityScore >= 75) {
        aiInsight = `You both prioritize ${topValue.toLowerCase()}, enjoy ${topInterest}, and share similar ${topTrait} traits. These shared characteristics contribute to your high compatibility.`;
      } else {
        aiInsight = `While you both have some shared interests like ${topInterest}, there are distinct differences in your core values and personality traits.`;
      }

      const isPremiumUser = u.role === "premium" || u.role === "admin";
      return {
      userId: u.id,
      isLocked,
      profile: {
        id: u.id,
        firstName: isLocked ? "Hidden" : u.firstName,
        displayName: isLocked ? "Hidden Profile" : u.displayName,
        age: calculateAge(u.dateOfBirth),
        occupation: u.occupation,
        education: u.education,
        city: u.city,
        country: u.country,
        religion: u.religion,
        bio: isLocked ? "Profile is locked. Upgrade to reveal or wait 30 days." : u.bio,
        photos: isLocked 
          ? [{ id: 0, url: "/blurred-avatar.png", isPrimary: true, publicId: "" }]
          : (photosByUser.get(u.id) || []).map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
        verificationStatus: u.verificationStatus,
        isPremium: u.role === "premium" || u.role === "admin",
        compatibilityScore,
        journeyProgress: u.journeyProgress,
        hasPendingInterest,
        interestSentByViewer,
        isMutualMatch,
        commonInterestsCount,
        sharedInterestsPreview: sharedInterests,
        valueMatchScore: result.personalityMatch || compatibilityScore,
          personalityMatch: result.personalityMatch ?? null,
          aiStoryMatch: result.aiStoryMatch ?? null,
        valueAlignment: (result as any).valueAlignment ?? null,
        communicationMatch: (result as any).communicationMatch ?? null,
        emotionalCompatibility: (result as any).emotionalCompatibility ?? null,
        overallCompatibility: (result as any).overallCompatibility ?? null,
          sConfidenceData: result.sConfidenceData ?? null,
          pConfidence: result.pConfidence ?? null,
          hasStories: result.hasStories ?? null,
      },
      compatibilityScore,
      commonTraits,
      aiInsight,
      isNew: i < 3,
      isMutualInterest: isMutualMatch,
    };
    }));

    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    const total = matches.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedMatches = matches.slice(offset, offset + limit);

    return res.json({ matches: paginatedMatches, total, page, totalPages, isLocked, daysRemaining: Math.max(0, 30 - daysPassed) });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /matches/network-stats
router.get("/network-stats", authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const blocked = await db.select({ blockedId: blockedUsersTable.blockedId })
      .from(blockedUsersTable).where(eq(blockedUsersTable.blockerId, req.user!.userId));
    const blockedIds = blocked.map((b) => b.blockedId);
    
    const oppositeGender = currentUser.gender === "male" ? "female" : currentUser.gender === "female" ? "male" : null;

    const whereConditions: any[] = [ne(usersTable.id, req.user!.userId)];
    if (oppositeGender) {
      whereConditions.push(eq(usersTable.gender, oppositeGender));
    }
    
    const eligibleUsers = await db.select({ id: usersTable.id, createdAt: usersTable.createdAt }).from(usersTable).where(and(...whereConditions));
    const eligibleUserIds = eligibleUsers.filter(u => !blockedIds.includes(u.id)).map(u => u.id);

    const currentUserProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, currentUser.id) });
    let unifiedScoresA = {};
    if (currentUserProfile?.finalUnifiedCategoryScores) {
      try { unifiedScoresA = JSON.parse(currentUserProfile.finalUnifiedCategoryScores); } catch (e) {}
    }

    const otherProfiles = eligibleUserIds.length > 0 ? await db.select().from(personalityProfilesTable).where(inArray(personalityProfilesTable.userId, eligibleUserIds)) : [];
    
    const { calculateDetailedInsights } = require("../services/keywordAnalysis");

    let totalMatches = 0;
    let sum = 0;
    let newThisWeek = 0;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const p of otherProfiles) {
      let unifiedScoresB = {};
      if (p.finalUnifiedCategoryScores) {
        try { unifiedScoresB = JSON.parse(p.finalUnifiedCategoryScores); } catch (e) {}
      }
      
      const { overallCompatibility } = calculateDetailedInsights(unifiedScoresA, unifiedScoresB);
      
      // Calculate final score using fallback (similar to calculateAndStoreCompatibility)
      const score = Math.min(100, Math.max(0, overallCompatibility !== null ? overallCompatibility : 50));
      
      // Count ALL eligible users as matches regardless of score
      totalMatches++;
      sum += score;
      
      const u = eligibleUsers.find(u => u.id === p.userId);
      if (u && u.createdAt >= sevenDaysAgo) {
        newThisWeek++;
      }
    }
    
    const averageCompatibility = totalMatches > 0 ? Math.round(sum / totalMatches) : 0;
    
    return res.json({
      totalMatches,
      averageCompatibility,
      newThisWeek
    });
  } catch (err) { 
    req.log.error(err); 
    return res.status(500).json({ error: "Internal server error" }); 
  }
});

// GET /matches/daily
router.get("/daily", authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const oppositeGender = currentUser.gender === "male" ? "female" : currentUser.gender === "female" ? "male" : null;
    const whereConditions: any[] = [ne(usersTable.id, req.user!.userId)];
    if (oppositeGender) {
      whereConditions.push(eq(usersTable.gender, oppositeGender));
    }

    const users = await db.select().from(usersTable).where(and(...whereConditions)).limit(5);
    const photos = await db.select().from(photosTable);
    const photosByUser = new Map<number, typeof photos>();
    photos.forEach((p) => {
      if (!photosByUser.has(p.userId)) photosByUser.set(p.userId, []);
      photosByUser.get(p.userId)!.push(p);
    });

    // Current user already fetched

    const daysPassed = currentUser.journeyStartedAt 
      ? Math.floor((Date.now() - currentUser.journeyStartedAt.getTime()) / (1000 * 60 * 60 * 24)) 
      : 0;
    const isLocked = false;

    const currentUserProfile = await db.query.personalityProfilesTable.findFirst({
      where: eq(personalityProfilesTable.userId, currentUser.id)
    });
    let currentTraits: any[] = [];
    if (currentUserProfile?.traits) {
      try { currentTraits = JSON.parse(currentUserProfile.traits); } catch(e){}
    }

    const dailyIds = users.map(u => u.id);
    const dailyProfiles = dailyIds.length > 0 ? await db.select().from(personalityProfilesTable).where(inArray(personalityProfilesTable.userId, dailyIds)) : [];
    const dailyProfileMap = new Map(dailyProfiles.map(p => [p.userId, p]));

    const daily = await Promise.all(users.map(async (u, i) => {
      let compatibilityScore = Math.floor(Math.random() * 20 + 75); // Fallback
      const targetProfile = dailyProfileMap.get(u.id);
      const result = await calculateAndStoreCompatibility(currentUserProfile, targetProfile, currentUser.id, u.id);
      compatibilityScore = result.compatibilityScore;
      console.log(`Daily Score for user ${u.id}:`, compatibilityScore);

      const currentUserInterests = parseInterests(currentUser.interests);
      const matchInterests = parseInterests(u.interests);
      const sharedInterests = currentUserInterests.filter((int: string) => matchInterests.includes(int));
      const commonInterestsCount = sharedInterests.length;

      const targetScores = targetProfile?.finalUnifiedCategoryScores ? JSON.parse(targetProfile.finalUnifiedCategoryScores) : {};
      const sortedTraits = Object.entries(targetScores).sort((a: any, b: any) => b[1] - a[1]).filter((entry: any) => entry[1] > 0).map(e => e[0]);
      
      const traitMap: Record<string, string> = {
        "Adventure & Travel": "Adventurous",
        "Family Values": "Family-oriented",
        "Career Focus": "Driven",
        "Kindness & Empathy": "Compassionate",
        "Emotional Wellbeing": "Calm",
        "Relationship Commitment": "Loyal",
        "Communication Style": "Communicative",
        "Personal Growth": "Growth-oriented",
        "Social Engagement": "Outgoing",
        "Health & Lifestyle": "Active"
      };
      
      const commonTraits = sortedTraits.slice(0, 3).map(t => traitMap[t] || t as string);
      if (commonTraits.length === 0) commonTraits.push("Mysterious");

      const topInterest = sharedInterests.length > 0 ? sharedInterests[0] : "new activities";
      const topTrait = commonTraits[0] ? commonTraits[0].toLowerCase() : "values";
      const topValue = sortedTraits[0] || "meaningful connections";
      
      let aiInsight = "";
      if (compatibilityScore >= 75) {
        aiInsight = `You both prioritize ${topValue.toLowerCase()}, enjoy ${topInterest}, and share similar ${topTrait} traits. These shared characteristics contribute to your high compatibility.`;
      } else {
        aiInsight = `While you both have some shared interests like ${topInterest}, there are distinct differences in your core values and personality traits.`;
      }

      return {
      userId: u.id,
      isLocked,
      profile: {
        id: u.id, 
        firstName: isLocked ? "Hidden" : u.firstName, 
        displayName: isLocked ? "Hidden Profile" : u.displayName,
        age: calculateAge(u.dateOfBirth), occupation: u.occupation,
        education: u.education, city: u.city, country: u.country,
        religion: u.religion, bio: isLocked ? "Profile is locked." : u.bio,
        photos: isLocked 
          ? [{ id: 0, url: "/blurred-avatar.png", isPrimary: true, publicId: "" }]
          : (photosByUser.get(u.id) || []).map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
        verificationStatus: u.verificationStatus,
        isPremium: u.role === "premium",
        compatibilityScore,
        journeyProgress: u.journeyProgress,
        commonInterestsCount,
        sharedInterestsPreview: sharedInterests,
        valueMatchScore: result.personalityMatch || compatibilityScore,
          personalityMatch: result.personalityMatch ?? null,
          aiStoryMatch: result.aiStoryMatch ?? null,
        valueAlignment: (result as any).valueAlignment ?? null,
        communicationMatch: (result as any).communicationMatch ?? null,
        emotionalCompatibility: (result as any).emotionalCompatibility ?? null,
        overallCompatibility: (result as any).overallCompatibility ?? null,
          sConfidenceData: result.sConfidenceData ?? null,
          pConfidence: result.pConfidence ?? null,
          hasStories: result.hasStories ?? null,
      },
      compatibilityScore,
      commonTraits,
      aiInsight,
      isNew: true,
      isMutualInterest: false,
    };
    }));

    daily.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.json({ matches: daily, isLocked, daysRemaining: Math.max(0, 30 - daysPassed) });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /matches/who-viewed-me
router.get("/who-viewed-me", authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    const oppositeGender = currentUser?.gender === "male" ? "female" : currentUser?.gender === "female" ? "male" : null;

    const whereConditions: any[] = [ne(usersTable.id, req.user!.userId)];
    if (oppositeGender) {
      whereConditions.push(eq(usersTable.gender, oppositeGender));
    } else {
      whereConditions.push(eq(usersTable.id, -1));
    }

    const users = await db.select().from(usersTable).limit(4).where(and(...whereConditions));
    const profiles = await Promise.all(users.map((u) => buildPublicProfile(u.id)));
    return res.json(profiles.filter(Boolean));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /matches/:matchId/compatibility
router.get("/:matchId/compatibility", authenticate, async (req: AuthRequest, res) => {
  try {
    const matchId = parseInt(req.params.matchId as string);
    const currentUserProfile = await db.query.personalityProfilesTable.findFirst({
      where: eq(personalityProfilesTable.userId, req.user!.userId)
    });
    const targetUserProfile = await db.query.personalityProfilesTable.findFirst({
      where: eq(personalityProfilesTable.userId, matchId)
    });

    const result = await calculateAndStoreCompatibility(currentUserProfile, targetUserProfile, req.user!.userId, matchId);
    console.log(`Chat Score for match ${matchId}:`, result.compatibilityScore);

    // Fetch stories (journals) for both users
    const [myJournals, theirJournals] = await Promise.all([
      db.select({ content: dailyJournalsTable.content })
        .from(dailyJournalsTable)
        .where(eq(dailyJournalsTable.userId, req.user!.userId)),
      db.select({ content: dailyJournalsTable.content })
        .from(dailyJournalsTable)
        .where(eq(dailyJournalsTable.userId, matchId)),
    ]);

    // Extract interests from story text using the keyword analysis engine
    const myInterests = extractStoryInterests(myJournals.map(j => j.content ?? "").filter(Boolean));
    const theirInterests = extractStoryInterests(theirJournals.map(j => j.content ?? "").filter(Boolean));

    const sharedInterests = myInterests.filter(i => theirInterests.includes(i));
    const myUniqueInterests = myInterests.filter(i => !theirInterests.includes(i));
    const theirUniqueInterests = theirInterests.filter(i => !myInterests.includes(i));
    const unionSize = new Set([...myInterests, ...theirInterests]).size;
    const interestMatchPct = unionSize > 0 ? Math.round((sharedInterests.length / unionSize) * 100) : 0;

    console.log(`[Interest] My story interests: [${myInterests.join(", ")}]`);
    console.log(`[Interest] Their story interests: [${theirInterests.join(", ")}]`);
    console.log(`[Interest] Shared: [${sharedInterests.join(", ")}] — ${interestMatchPct}% Jaccard match`);

    return res.json({ ...result, sharedInterests, myUniqueInterests, theirUniqueInterests, interestMatchPct, myInterests, theirInterests, interestsAreDerived: false });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
