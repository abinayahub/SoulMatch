import { Router } from "express";
import { db, dailyReflectionsTable, userReflectionStatsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { dailyPollsCache } from "../lib/dailyPolls";
import { z } from "zod";

const router = Router();

// Helper to get today's date string (YYYY-MM-DD)
const getTodayStr = () => new Date().toISOString().split("T")[0];

router.get("/today", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const today = getTodayStr();

    // Check if answered today
    const existingReflection = await db.query.dailyReflectionsTable.findFirst({
      where: and(
        eq(dailyReflectionsTable.userId, userId),
        eq(dailyReflectionsTable.reflectionDate, today)
      ),
    });

    if (existingReflection) {
      // Get stats
      const stats = await db.query.userReflectionStatsTable.findFirst({
        where: eq(userReflectionStatsTable.userId, userId),
      });

      // Find tomorrow's date for countdown in frontend
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      return res.json({
        answered: true,
        answer: existingReflection.answer,
        currentStreak: stats?.currentStreak || 1,
        nextReflectionTime: tomorrow.toISOString(),
      });
    }

    // Need a new question. Exclude recently answered questions (last 30 days)
    const recentReflections = await db.query.dailyReflectionsTable.findMany({
      where: eq(dailyReflectionsTable.userId, userId),
      orderBy: desc(dailyReflectionsTable.reflectionDate),
      limit: 30,
    });

    const recentIds = new Set(recentReflections.map((r) => r.questionId));
    
    // Filter available
    let availableQuestions = dailyPollsCache.filter((q) => !recentIds.has(q.id));
    if (availableQuestions.length === 0) {
      // Fallback if all 500 answered in last 30 days (impossible, but good to check)
      availableQuestions = dailyPollsCache;
    }

    // Hash userId + today to get deterministic pseudo-random index
    const hashStr = `${userId}-${today}`;
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
      hash = (hash << 5) - hash + hashStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % availableQuestions.length;
    const question = availableQuestions[index];

    return res.json({
      answered: false,
      question: question,
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const submitReflectionSchema = z.object({
  questionId: z.number(),
  answer: z.string(),
});

router.post("/today", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const today = getTodayStr();

    const parsed = submitReflectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    const { questionId, answer } = parsed.data;

    // Check if already answered today
    const existing = await db.query.dailyReflectionsTable.findFirst({
      where: and(
        eq(dailyReflectionsTable.userId, userId),
        eq(dailyReflectionsTable.reflectionDate, today)
      ),
    });

    if (existing) {
      return res.status(400).json({ error: "Already answered today" });
    }

    // Get current stats
    let stats = await db.query.userReflectionStatsTable.findFirst({
      where: eq(userReflectionStatsTable.userId, userId),
    });

    let currentStreak = 1;
    let longestStreak = 1;
    let totalReflections = 1;

    if (stats) {
      const lastDate = stats.lastReflectionDate ? new Date(stats.lastReflectionDate) : null;
      let isConsecutive = false;
      
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const lastDateNormalized = new Date(lastDate);
        lastDateNormalized.setHours(0, 0, 0, 0);

        if (lastDateNormalized.getTime() === yesterday.getTime()) {
          isConsecutive = true;
        }
      }

      currentStreak = isConsecutive ? stats.currentStreak + 1 : 1;
      longestStreak = Math.max(stats.longestStreak, currentStreak);
      totalReflections = stats.totalReflections + 1;
    }

    // Transaction
    await db.transaction(async (tx) => {
      await tx.insert(dailyReflectionsTable).values({
        userId,
        questionId,
        answer,
        reflectionDate: today,
      });

      if (stats) {
        await tx.update(userReflectionStatsTable)
          .set({
            currentStreak,
            longestStreak,
            lastReflectionDate: today,
            totalReflections,
          })
          .where(eq(userReflectionStatsTable.userId, userId));
      } else {
        await tx.insert(userReflectionStatsTable).values({
          userId,
          currentStreak,
          longestStreak,
          lastReflectionDate: today,
          totalReflections,
        });
      }
    });

    return res.json({ success: true, currentStreak });
  } catch (error) {
    req.log.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/history", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const history = await db.query.dailyReflectionsTable.findMany({
      where: eq(dailyReflectionsTable.userId, userId),
      orderBy: desc(dailyReflectionsTable.reflectionDate),
      limit: 50,
    });

    // Populate question text
    const populated = history.map((item) => {
      const q = dailyPollsCache.find((poll) => poll.id === item.questionId);
      return {
        id: item.id,
        date: item.reflectionDate,
        question: q?.question || "Unknown Question",
        answer: item.answer,
      };
    });

    return res.json(populated);
  } catch (error) {
    req.log.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const stats = await db.query.userReflectionStatsTable.findFirst({
      where: eq(userReflectionStatsTable.userId, userId),
    });

    // Calculate most selected mood/answer
    const allReflections = await db.query.dailyReflectionsTable.findMany({
      where: eq(dailyReflectionsTable.userId, userId),
    });
    
    let mostSelectedMood = "None";
    if (allReflections.length > 0) {
      const counts: Record<string, number> = {};
      for (const r of allReflections) {
        counts[r.answer] = (counts[r.answer] || 0) + 1;
      }
      mostSelectedMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    return res.json({
      totalReflections: stats?.totalReflections || 0,
      currentStreak: stats?.currentStreak || 0,
      longestStreak: stats?.longestStreak || 0,
      mostSelectedMood,
      completionRate: stats ? Math.min(100, Math.round((stats.totalReflections / 30) * 100)) : 0, // Mock 30 days scale for completion rate
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
