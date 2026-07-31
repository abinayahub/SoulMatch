import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, photosTable, matchPreferencesTable,
  notificationsTable, reportsTable, blockedUsersTable, verificationsTable,
  profileViewsTable
} from "@workspace/db";
import { eq, and, ne, not, inArray } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../lib/auth";
import { buildUserProfile, buildPublicProfile, calculateAge, calculateProfileCompleteness } from "../lib/helpers";

const router = Router();

// GET /users/active
router.get("/active", authenticate, async (req: AuthRequest, res) => {
  try {
    const { sql } = require('drizzle-orm');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await db.query.usersTable.findMany({
      where: (table, { gte }) => gte(table.lastActive, fiveMinutesAgo),
      orderBy: (table, { desc }) => [desc(table.lastActive)],
      limit: 10
    });
    
    // Instead of using sql template literal with a string (which can fail due to Date formatting),
    // let's just count the active users correctly using eq/gte or simple count.
    const allActive = await db.query.usersTable.findMany({
      where: (table, { gte }) => gte(table.lastActive, fiveMinutesAgo),
      columns: { id: true }
    });
    
    const profiles = (await Promise.all(activeUsers.slice(0, 5).map(async user => {
      const p = await buildPublicProfile(user.id, req.user!.userId);
      if (!p) return null;
      return { id: p.id, displayName: p.displayName, photos: p.photos };
    }))).filter(Boolean);
    
    res.json({ total: allActive.length, users: profiles });
  } catch (err) { 
    req.log.error(err); 
    res.status(500).json({ error: "Internal server error" }); 
  }
});

// GET /users/me
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(await buildUserProfile(user));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /users/me
router.patch("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      firstName, lastName, displayName, bio, occupation, education, religion,
      motherTongue, city, country, height, maritalStatus, dietaryPreference,
      smoking, drinking, interests, languages,
      videoIntroUrl, govIdFrontUrl, govIdBackUrl, selfieUrl, isGovIdVerified, isSelfieVerified,
      weight, fieldOfStudy, company, industry, annualIncomeRange, stateRegion, citizenship,
      gender, dateOfBirth, phone
    } = req.body;

    const [updated] = await db.update(usersTable).set({
      ...(firstName && { firstName }), ...(lastName && { lastName }),
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }), ...(occupation !== undefined && { occupation }),
      ...(education !== undefined && { education }), ...(religion !== undefined && { religion }),
      ...(motherTongue !== undefined && { motherTongue }),
      ...(city !== undefined && { city }), ...(country !== undefined && { country }),
      ...(height !== undefined && { height: height === "" || height === null ? null : Number(height) }),
      ...(weight !== undefined && { weight: weight === "" || weight === null ? null : Number(weight) }),
      ...(maritalStatus !== undefined && { maritalStatus }),
      ...(dietaryPreference !== undefined && { dietaryPreference }),
      ...(smoking !== undefined && { smoking }), ...(drinking !== undefined && { drinking }),
      ...(interests !== undefined && { interests }), ...(languages !== undefined && { languages }),
      ...(fieldOfStudy !== undefined && { fieldOfStudy }),
      ...(company !== undefined && { company }),
      ...(industry !== undefined && { industry }),
      ...(annualIncomeRange !== undefined && { annualIncomeRange }),
      ...(stateRegion !== undefined && { stateRegion }),
      ...(citizenship !== undefined && { citizenship }),
      ...(videoIntroUrl !== undefined && { videoIntroUrl }),
      ...(govIdFrontUrl !== undefined && { govIdFrontUrl }),
      ...(govIdBackUrl !== undefined && { govIdBackUrl }),
      ...(selfieUrl !== undefined && { selfieUrl }),
      ...(isGovIdVerified !== undefined && { isGovIdVerified }),
      ...(isSelfieVerified !== undefined && { isSelfieVerified }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(phone !== undefined && { phone }),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, req.user!.userId)).returning();

    return res.json(await buildUserProfile(updated));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /users/me/photos
router.post("/me/photos", authenticate, async (req: AuthRequest, res) => {
  try {
    const { url, publicId, isPrimary } = req.body;
    if (!url || !publicId) return res.status(400).json({ error: "url and publicId required" });

    if (isPrimary) {
      await db.update(photosTable).set({ isPrimary: false }).where(eq(photosTable.userId, req.user!.userId));
    }

    const existing = await db.select().from(photosTable).where(eq(photosTable.userId, req.user!.userId));
    await db.insert(photosTable).values({
      userId: req.user!.userId, url, publicId, isPrimary: isPrimary || existing.length === 0,
    });

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    return res.json(await buildUserProfile(user!));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /users/me/photos/:photoId
router.delete("/me/photos/:photoId", authenticate, async (req: AuthRequest, res) => {
  try {
    const photoId = parseInt(req.params.photoId as string);
    await db.delete(photosTable).where(and(eq(photosTable.id, photoId), eq(photosTable.userId, req.user!.userId)));
    return res.json({ message: "Photo deleted" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /users/me/preferences
router.get("/me/preferences", authenticate, async (req: AuthRequest, res) => {
  try {
    let pref = await db.query.matchPreferencesTable.findFirst({ where: eq(matchPreferencesTable.userId, req.user!.userId) });
    if (!pref) {
      const [newPref] = await db.insert(matchPreferencesTable).values({ userId: req.user!.userId }).returning();
      pref = newPref;
    }
    return res.json(pref);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// PUT /users/me/preferences
router.put("/me/preferences", authenticate, async (req: AuthRequest, res) => {
  try {
    const { minAge, maxAge, minHeight, maxHeight, preferredReligions, preferredEducation, preferredLocations, maritalStatus } = req.body;
    const existing = await db.query.matchPreferencesTable.findFirst({ where: eq(matchPreferencesTable.userId, req.user!.userId) });

    if (existing) {
      const [updated] = await db.update(matchPreferencesTable).set({
        ...(minAge !== undefined && { minAge }), ...(maxAge !== undefined && { maxAge }),
        ...(minHeight !== undefined && { minHeight }), ...(maxHeight !== undefined && { maxHeight }),
        ...(preferredReligions !== undefined && { preferredReligions }),
        ...(preferredEducation !== undefined && { preferredEducation }),
        ...(preferredLocations !== undefined && { preferredLocations }),
        ...(maritalStatus !== undefined && { maritalStatus }),
        updatedAt: new Date(),
      }).where(eq(matchPreferencesTable.userId, req.user!.userId)).returning();
      return res.json(updated);
    } else {
      const [created] = await db.insert(matchPreferencesTable).values({
        userId: req.user!.userId, minAge, maxAge, minHeight, maxHeight,
        preferredReligions, preferredEducation, preferredLocations, maritalStatus,
      }).returning();
      return res.json(created);
    }
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /users/me/stats
router.get("/me/stats", authenticate, async (req: AuthRequest, res) => {
  try {
    const { interestsTable } = await import("@workspace/db");
    const { count, sql } = await import("drizzle-orm");

    const [sentResult] = await db.select({ count: count() }).from(interestsTable).where(eq(interestsTable.fromUserId, req.user!.userId));
    const [receivedResult] = await db.select({ count: count() }).from(interestsTable).where(eq(interestsTable.toUserId, req.user!.userId));
    const [mutualResult] = await db.select({ count: count() }).from(interestsTable)
      .where(and(eq(interestsTable.toUserId, req.user!.userId), eq(interestsTable.status, "accepted")));

    return res.json({
      profileViews: Math.floor(Math.random() * 50 + 10),
      interestsSent: sentResult.count,
      interestsReceived: receivedResult.count,
      mutualInterests: mutualResult.count,
      matchRate: receivedResult.count > 0 ? (mutualResult.count / receivedResult.count) : 0,
      recentViewers: [],
      weeklyViews: Math.floor(Math.random() * 20 + 5),
      responseRate: 0.72,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /users/:userId
router.get("/:userId", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId as string);
    const viewerId = req.user!.userId;

    const viewer = await db.query.usersTable.findFirst({ where: eq(usersTable.id, viewerId) });
    const isCompleted = viewer?.journeyCompleted || (viewer?.journeyProgress || 0) >= 30;

    if (userId !== viewerId && !isCompleted) {
      return res.status(403).json({
        error: "Complete your 30-Day Journey",
        message: "Answer your daily questions and continue posting stories to unlock compatible matches.",
        isLocked: true
      });
    }

    const profile = await buildPublicProfile(userId, viewerId);
    if (!profile) return res.status(404).json({ error: "User not found" });
    
    // Log profile view if not viewing own profile
    if (userId !== viewerId) {
      await db.insert(profileViewsTable).values({
        viewerId,
        targetUserId: userId,
      });
    }

    return res.json(profile);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /users/me/verification
router.post("/me/verification", authenticate, async (req: AuthRequest, res) => {
  try {
    const { documentType, documentUrl, selfieUrl } = req.body;
    if (!documentType || !documentUrl) return res.status(400).json({ error: "documentType and documentUrl required" });

    await db.insert(verificationsTable).values({
      userId: req.user!.userId,
      documentType,
      documentUrl,
      selfieUrl: selfieUrl || null,
    });

    await db.update(usersTable).set({ verificationStatus: "pending" }).where(eq(usersTable.id, req.user!.userId));
    return res.json({ message: "Verification submitted successfully" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
