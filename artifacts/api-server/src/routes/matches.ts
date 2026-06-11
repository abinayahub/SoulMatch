import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, photosTable, blockedUsersTable } from "@workspace/db";
import { ne, eq, not, inArray } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { buildPublicProfile, calculateAge } from "../lib/helpers";

const router = Router();

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

    const allUsers = await db.select().from(usersTable)
      .where(ne(usersTable.id, req.user!.userId))
      .limit(limit + 20)
      .offset(offset);

    const filtered = allUsers
      .filter((u) => !blockedIds.includes(u.id) && u.status === "active")
      .slice(0, limit);

    const photos = await db.select().from(photosTable);
    const photosByUser = new Map<number, typeof photos>();
    photos.forEach((p) => {
      if (!photosByUser.has(p.userId)) photosByUser.set(p.userId, []);
      photosByUser.get(p.userId)!.push(p);
    });

    const matches = filtered.map((u, i) => ({
      userId: u.id,
      profile: {
        id: u.id,
        firstName: u.firstName,
        displayName: u.displayName,
        age: calculateAge(u.dateOfBirth),
        occupation: u.occupation,
        education: u.education,
        city: u.city,
        country: u.country,
        religion: u.religion,
        bio: u.bio,
        photos: (photosByUser.get(u.id) || []).map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
        verificationStatus: u.verificationStatus,
        isPremium: u.role === "premium" || u.role === "admin",
        compatibilityScore: Math.floor(Math.random() * 30 + 65),
        journeyProgress: u.journeyProgress,
      },
      compatibilityScore: Math.floor(Math.random() * 30 + 65),
      commonTraits: COMMON_TRAITS[i % COMMON_TRAITS.length],
      aiInsight: AI_INSIGHTS[i % AI_INSIGHTS.length],
      isNew: i < 3,
      isMutualInterest: false,
    }));

    return res.json({ matches, total: 100, page, totalPages: 10 });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /matches/daily
router.get("/daily", authenticate, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(ne(usersTable.id, req.user!.userId)).limit(5);
    const photos = await db.select().from(photosTable);
    const photosByUser = new Map<number, typeof photos>();
    photos.forEach((p) => {
      if (!photosByUser.has(p.userId)) photosByUser.set(p.userId, []);
      photosByUser.get(p.userId)!.push(p);
    });

    const daily = users.map((u, i) => ({
      userId: u.id,
      profile: {
        id: u.id, firstName: u.firstName, displayName: u.displayName,
        age: calculateAge(u.dateOfBirth), occupation: u.occupation,
        education: u.education, city: u.city, country: u.country,
        religion: u.religion, bio: u.bio,
        photos: (photosByUser.get(u.id) || []).map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
        verificationStatus: u.verificationStatus,
        isPremium: u.role === "premium",
        compatibilityScore: Math.floor(Math.random() * 20 + 75),
        journeyProgress: u.journeyProgress,
      },
      compatibilityScore: Math.floor(Math.random() * 20 + 75),
      commonTraits: COMMON_TRAITS[i % COMMON_TRAITS.length],
      aiInsight: AI_INSIGHTS[i % AI_INSIGHTS.length],
      isNew: true,
      isMutualInterest: false,
    }));

    return res.json(daily);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /matches/who-viewed-me
router.get("/who-viewed-me", authenticate, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).limit(4).where(ne(usersTable.id, req.user!.userId));
    const profiles = await Promise.all(users.map((u) => buildPublicProfile(u.id)));
    return res.json(profiles.filter(Boolean));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /matches/:matchId/compatibility
router.get("/:matchId/compatibility", authenticate, async (req: AuthRequest, res) => {
  try {
    const matchId = parseInt(req.params.matchId as string);
    const DIMENSIONS = [
      { dimension: "Values & Life Goals", score: Math.floor(Math.random() * 20 + 75), description: "Both prioritize family and long-term commitment" },
      { dimension: "Communication Style", score: Math.floor(Math.random() * 20 + 70), description: "Complementary communication patterns" },
      { dimension: "Emotional Intelligence", score: Math.floor(Math.random() * 25 + 70), description: "High empathy and emotional awareness" },
      { dimension: "Lifestyle Compatibility", score: Math.floor(Math.random() * 20 + 65), description: "Similar daily rhythms and preferences" },
      { dimension: "Spiritual Alignment", score: Math.floor(Math.random() * 30 + 60), description: "Shared spiritual values and practices" },
    ];

    const overall = Math.round(DIMENSIONS.reduce((sum, d) => sum + d.score, 0) / DIMENSIONS.length);

    return res.json({
      score: overall,
      breakdown: DIMENSIONS,
      summary: `With a ${overall}% compatibility score, you and this profile share meaningful values and complementary personalities. Your connection potential is strong.`,
      strengthAreas: ["Emotional connection", "Life goals alignment", "Communication"],
      growthAreas: ["Lifestyle habits", "Social preferences"],
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
