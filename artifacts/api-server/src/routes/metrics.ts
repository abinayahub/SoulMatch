import { Router } from "express";
import { db, systemMetricsTable, dailyJournalsTable, dailyReflectionsTable, journeyAnswersTable, profileViewsTable, interestsTable } from "@workspace/db";
import { eq, and, gte, lt } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/today", authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const metrics = await db.query.systemMetricsTable.findFirst({
      where: eq(systemMetricsTable.date, today)
    });

    if (metrics) {
      return res.json(metrics);
    } else {
      return res.json({ aiRequests: 0, storiesAnalyzed: 0, cacheHits: 0 });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// GET /metrics/weekly-summary
router.get("/weekly-summary", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // Queries for the current week
    const thisWeekStories = await db.select().from(dailyJournalsTable)
      .where(and(eq(dailyJournalsTable.userId, userId), gte(dailyJournalsTable.createdAt, sevenDaysAgo)));
    const thisWeekReflections = await db.select().from(dailyReflectionsTable)
      .where(and(eq(dailyReflectionsTable.userId, userId), gte(dailyReflectionsTable.createdAt, sevenDaysAgo)));
      
    const thisWeekQuestions = await db.select().from(journeyAnswersTable)
      .where(and(eq(journeyAnswersTable.userId, userId), gte(journeyAnswersTable.createdAt, sevenDaysAgo)));

    const thisWeekViews = await db.select().from(profileViewsTable)
      .where(and(eq(profileViewsTable.targetUserId, userId), gte(profileViewsTable.viewedAt, sevenDaysAgo)));

    const thisWeekMatches = await db.select().from(interestsTable)
      .where(and(eq(interestsTable.toUserId, userId), eq(interestsTable.status, "accepted"), gte(interestsTable.updatedAt, sevenDaysAgo)));

    // Queries for the previous week
    const lastWeekStories = await db.select().from(dailyJournalsTable)
      .where(and(eq(dailyJournalsTable.userId, userId), gte(dailyJournalsTable.createdAt, fourteenDaysAgo), lt(dailyJournalsTable.createdAt, sevenDaysAgo)));
    const lastWeekReflections = await db.select().from(dailyReflectionsTable)
      .where(and(eq(dailyReflectionsTable.userId, userId), gte(dailyReflectionsTable.createdAt, fourteenDaysAgo), lt(dailyReflectionsTable.createdAt, sevenDaysAgo)));
      
    const lastWeekQuestions = await db.select().from(journeyAnswersTable)
      .where(and(eq(journeyAnswersTable.userId, userId), gte(journeyAnswersTable.createdAt, fourteenDaysAgo), lt(journeyAnswersTable.createdAt, sevenDaysAgo)));

    const lastWeekViews = await db.select().from(profileViewsTable)
      .where(and(eq(profileViewsTable.targetUserId, userId), gte(profileViewsTable.viewedAt, fourteenDaysAgo), lt(profileViewsTable.viewedAt, sevenDaysAgo)));

    const lastWeekMatches = await db.select().from(interestsTable)
      .where(and(eq(interestsTable.toUserId, userId), eq(interestsTable.status, "accepted"), gte(interestsTable.updatedAt, fourteenDaysAgo), lt(interestsTable.updatedAt, sevenDaysAgo)));

    const thisWeekUniqueQuestions = new Set(thisWeekQuestions.map(q => q.questionId)).size;
    const lastWeekUniqueQuestions = new Set(lastWeekQuestions.map(q => q.questionId)).size;

    const responseData = {
      stories: { current: thisWeekStories.length, previous: lastWeekStories.length },
      questions: { current: thisWeekUniqueQuestions, previous: lastWeekUniqueQuestions },
      views: { current: thisWeekViews.length, previous: lastWeekViews.length },
      matches: { current: thisWeekMatches.length, previous: lastWeekMatches.length },
    };
    console.log(`[Metrics] Weekly Summary for user ${userId}:`, responseData);
    return res.json(responseData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch weekly summary" });
  }
});

export default router;
