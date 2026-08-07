import { Router } from "express";
import { z } from "zod";
import { db, dailyJournalsTable, personalityProfilesTable, insertDailyJournalSchema, usersTable, journeyAnswersTable, storyLikesTable, storyCommentsTable } from "@workspace/db";
import { eq, desc, inArray, sql, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";

import { analyzeStoryContextually, generateCumulativeStoryProfile, generateStorySummary, CumulativeStoryProfile } from "../services/storyAnalysisEngine";

const router = Router();

// Post a new journal
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const body = req.body;
    
    // Validate request
    const schema = z.object({
      content: z.string().min(1),
      imageUrl: z.string().optional(),
    });
    
    const parsed = schema.parse(body);

    // Insert journal
    const [journal] = await db.insert(dailyJournalsTable).values({
      userId,
      content: parsed.content,
      imageUrl: parsed.imageUrl,
    }).returning();

    // Fetch existing profile
    let profile = await db.query.personalityProfilesTable.findFirst({
      where: eq(personalityProfilesTable.userId, userId)
    });
    
    if (!profile) {
      // Create empty profile if none exists
      const [newProfile] = await db.insert(personalityProfilesTable).values({
        userId,
        storyCategoryScores: "{}"
      }).returning();
      profile = newProfile;
    }

    const currentCumulative = profile.storyCategoryScores ? JSON.parse(profile.storyCategoryScores) : undefined;
    
    // Analyze Contextually
    const analysis = await analyzeStoryContextually(parsed.content);
    
    // Update Cumulative Profile
    const cumulativeProfile = generateCumulativeStoryProfile(analysis, currentCumulative.totalStories !== undefined ? currentCumulative : undefined);
    const storySummary = generateStorySummary(cumulativeProfile);
    
    // Attach summary to the profile payload
    (cumulativeProfile as any).storySummary = storySummary;
    
    await db.update(personalityProfilesTable)
      .set({ storyCategoryScores: JSON.stringify(cumulativeProfile), generatedAt: new Date() })
      .where(eq(personalityProfilesTable.userId, userId));
      
    await db.update(dailyJournalsTable)
      .set({ aiAnalysis: { insights: [storySummary], analysis, cumulativeProfile } })
      .where(eq(dailyJournalsTable.id, journal.id));

    res.status(201).json(journal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: "Failed to create journal" });
    }
  }
});

// Get my personal journal feed
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const journals = await db.select()
      .from(dailyJournalsTable)
      .where(eq(dailyJournalsTable.userId, userId))
      .orderBy(desc(dailyJournalsTable.createdAt));
      
    if (journals.length === 0) return res.json([]);

    const journalIds = journals.map(j => j.id);
    const likes = await db.select().from(storyLikesTable).where(inArray(storyLikesTable.journalId, journalIds));
    const commentsData = await db.select({
      id: storyCommentsTable.id,
      journalId: storyCommentsTable.journalId,
      content: storyCommentsTable.content,
      createdAt: storyCommentsTable.createdAt,
      user: {
        id: usersTable.id,
        firstName: usersTable.firstName,
      }
    }).from(storyCommentsTable)
      .innerJoin(usersTable, eq(storyCommentsTable.userId, usersTable.id))
      .where(inArray(storyCommentsTable.journalId, journalIds))
      .orderBy(storyCommentsTable.createdAt);

    const enrichedJournals = journals.map(j => ({
      ...j,
      likes: likes.filter(l => l.journalId === j.id).length,
      hasLiked: likes.some(l => l.journalId === j.id && l.userId === userId),
      comments: commentsData.filter(c => c.journalId === j.id)
    }));
      
    return res.json(enrichedJournals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch personal journal" });
  }
});

// Get highly compatible matches' journals (requires Day 30+)
router.get("/feed", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // Check if user has answered 30 questions (simulating Day 30 rule)
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, userId));
    const day30Unlocked = answers.length >= 30; // Just a simplistic check for 30 questions

    // Get current user to determine gender for heterosexual matching
    const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    
    let targetGender: "male" | "female" | null = null;
    if (currentUser?.gender === "male") targetGender = "female";
    else if (currentUser?.gender === "female") targetGender = "male";

    const conditions = [sql`${usersTable.id} != ${userId}`];
    if (targetGender) {
      conditions.push(eq(usersTable.gender, targetGender));
    }

    // For now, fetch opposite gender's journals to mock the "matches" feed
    const allOtherJournals = await db.select({
      id: dailyJournalsTable.id,
      content: dailyJournalsTable.content,
      imageUrl: dailyJournalsTable.imageUrl,
      createdAt: dailyJournalsTable.createdAt,
      aiAnalysis: dailyJournalsTable.aiAnalysis,
      user: {
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      }
    })
    .from(dailyJournalsTable)
    .innerJoin(usersTable, eq(dailyJournalsTable.userId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(dailyJournalsTable.createdAt));

    if (allOtherJournals.length === 0) {
      return res.json({ unlocked: day30Unlocked, journals: [] });
    }

    const journalIds = allOtherJournals.map(j => j.id);
    const likes = await db.select().from(storyLikesTable).where(inArray(storyLikesTable.journalId, journalIds));
    const commentsData = await db.select({
      id: storyCommentsTable.id,
      journalId: storyCommentsTable.journalId,
      content: storyCommentsTable.content,
      createdAt: storyCommentsTable.createdAt,
      user: {
        id: usersTable.id,
        firstName: usersTable.firstName,
      }
    }).from(storyCommentsTable)
      .innerJoin(usersTable, eq(storyCommentsTable.userId, usersTable.id))
      .where(inArray(storyCommentsTable.journalId, journalIds))
      .orderBy(storyCommentsTable.createdAt);

    const enrichedJournals = allOtherJournals.map(j => ({
      ...j,
      likes: likes.filter(l => l.journalId === j.id).length,
      hasLiked: likes.some(l => l.journalId === j.id && l.userId === userId),
      comments: commentsData.filter(c => c.journalId === j.id)
    }));

    return res.json({
      unlocked: day30Unlocked,
      journals: enrichedJournals
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// Delete a personal journal
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const journalId = parseInt(req.params.id as string);
    const userId = req.user!.userId;

    const [journal] = await db.select().from(dailyJournalsTable).where(eq(dailyJournalsTable.id, journalId));
    
    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }
    
    if (journal.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this journal" });
    }

    await db.delete(dailyJournalsTable).where(eq(dailyJournalsTable.id, journalId));

    // Recalculate the user's cumulative personality profile from scratch using the new centralized generator
    const profile = await generateFullUserProfile(userId);

    const remainingJournals = await db.select().from(dailyJournalsTable).where(eq(dailyJournalsTable.userId, userId));
    const unifiedScores = profile?.finalUnifiedCategoryScores ? JSON.parse(profile.finalUnifiedCategoryScores) : {};

    // Update the newest journal's cumulativeProfile so the frontend UI stays perfectly synced!
    const newestJournal = [...remainingJournals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (newestJournal && newestJournal.aiAnalysis) {
      const newCumulativeProfile = generateCumulativeProfile(unifiedScores, remainingJournals);
      const updatedAiAnalysis = { ...newestJournal.aiAnalysis, cumulativeProfile: newCumulativeProfile };
      await db.update(dailyJournalsTable)
        .set({ aiAnalysis: updatedAiAnalysis })
        .where(eq(dailyJournalsTable.id, newestJournal.id));
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete journal" });
  }
});

export default router;

// Toggle Like
router.post("/:id/like", authenticate, async (req: AuthRequest, res) => {
  try {
    const journalId = parseInt(req.params.id as string);
    const userId = req.user!.userId;

    const existingLike = await db.select().from(storyLikesTable).where(and(eq(storyLikesTable.journalId, journalId), eq(storyLikesTable.userId, userId)));
    
    if (existingLike.length > 0) {
      await db.delete(storyLikesTable).where(eq(storyLikesTable.id, existingLike[0].id));
      return res.json({ liked: false });
    } else {
      await db.insert(storyLikesTable).values({ journalId, userId });
      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Post Comment
router.post("/:id/comment", authenticate, async (req: AuthRequest, res) => {
  try {
    const journalId = parseInt(req.params.id as string);
    const userId = req.user!.userId;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: "Content is required" });
    }

    const [comment] = await db.insert(storyCommentsTable).values({
      journalId,
      userId,
      content
    }).returning();

    const [user] = await db.select({ firstName: usersTable.firstName }).from(usersTable).where(eq(usersTable.id, userId));

    return res.status(201).json({ ...comment, user: { firstName: user.firstName } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to post comment" });
  }
});
