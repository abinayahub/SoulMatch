import { Router } from "express";
import fs from 'fs';
import path from 'path';
import { db } from "@workspace/db";
import { journeyQuestionsTable, journeyAnswersTable, personalityProfilesTable, usersTable, dailyPollAnswersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { dailyPollsCache } from "../lib/dailyPolls";
import { generateFullUserProfile } from "../services/profileGenerator";

function getJourneyLockStatus(
  answeredCount: number,
  lastAnswer: any,
  timezoneOffset: number // in minutes
): { isLocked: boolean; unlockedAt: string | null } {
  if (answeredCount === 0 || answeredCount % 5 !== 0 || !lastAnswer || !lastAnswer.createdAt) {
    return { isLocked: false, unlockedAt: null };
  }
  if (answeredCount >= 150) {
    return { isLocked: true, unlockedAt: null };
  }

  const now = new Date();
  const lastAnswerDate = new Date(lastAnswer.createdAt);

  if (isNaN(lastAnswerDate.getTime())) {
    return { isLocked: false, unlockedAt: null };
  }

  // Convert a UTC Date to its local YYYY-MM-DD string representation based on client offset
  const getLocalDateString = (d: Date) => {
    const localTimeMs = d.getTime() - (timezoneOffset * 60 * 1000);
    const localDate = new Date(localTimeMs);
    const year = localDate.getUTCFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(now);
  const completedDayStr = getLocalDateString(lastAnswerDate);

  if (todayStr === completedDayStr) {
    // Calculate local midnight of tomorrow
    const localTimeMs = now.getTime() - (timezoneOffset * 60 * 1000);
    const tomorrowLocal = new Date(localTimeMs);
    tomorrowLocal.setUTCDate(tomorrowLocal.getUTCDate() + 1);
    tomorrowLocal.setUTCHours(0, 0, 0, 0);

    // Convert local midnight back to UTC ISO string
    const unlockTimeUTC = new Date(tomorrowLocal.getTime() + (timezoneOffset * 60 * 1000));
    return {
      isLocked: true,
      unlockedAt: unlockTimeUTC.toISOString()
    };
  }

  return { isLocked: false, unlockedAt: null };
}

const router = Router();

const PERSONALITY_TRAITS = [
  { trait: "Openness", description: "Curiosity and appreciation for new experiences" },
  { trait: "Conscientiousness", description: "Organization and dependability" },
  { trait: "Extraversion", description: "Social energy and assertiveness" },
  { trait: "Agreeableness", description: "Cooperation and empathy" },
  { trait: "Emotional Stability", description: "Calmness and resilience under stress" },
];

// GET /journey/questions
router.get("/questions", authenticate, async (req: AuthRequest, res) => {
  try {
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, req.user!.userId));
    
    // Check timezone-aware calendar lockout
    const tzOffsetHeader = req.headers['x-timezone-offset'];
    const timezoneOffset = tzOffsetHeader ? parseInt(tzOffsetHeader as string, 10) : 0;
    const lastAnswer = answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const lockStatus = getJourneyLockStatus(answers.length, lastAnswer, timezoneOffset);
    if (lockStatus.isLocked) {
      return res.json([]);
    }

    const answeredIds = new Set(answers.map((a) => a.questionId));

    const allActiveQuestions = await db.select().from(journeyQuestionsTable).where(eq(journeyQuestionsTable.isActive, true)).orderBy(journeyQuestionsTable.id);

    let currentDay = 1;
    for (let d = 1; d <= 30; d++) {
      currentDay = d;
      const dayQs = allActiveQuestions.filter(q => q.day === d);
      if (dayQs.length === 0) continue;
      const allAnswered = dayQs.every(q => answeredIds.has(q.id));
      if (!allAnswered) {
        break;
      }
    }

    // Only fetch questions for the current day
    const questions = allActiveQuestions.filter(q => q.day === currentDay);

    return res.json(questions.map((q) => ({
      id: q.id,
      day: q.day,
      category: q.category,
      question: q.question,
      description: q.description,
      questionType: q.questionType,
      options: q.options || [],
      isAnswered: answeredIds.has(q.id),
    })));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: err instanceof Error ? String(err) + ' ' + (err.stack || '') : String(err) }); }
});

// GET /journey/progress
router.get("/progress", authenticate, async (req: AuthRequest, res) => {
  try {
    const questions = await db.select().from(journeyQuestionsTable).where(eq(journeyQuestionsTable.isActive, true));
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, req.user!.userId));
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });

    const totalQuestions = questions.length;
    const answeredQuestions = answers.length;
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    
    let currentDay = 1;
    for (let d = 1; d <= 30; d++) {
      currentDay = d;
      const dayQs = questions.filter(q => q.day === d);
      if (dayQs.length === 0) continue;
      const allAnswered = dayQs.every(q => answers.some(a => a.questionId === q.id));
      if (!allAnswered) {
        break;
      }
    }

    const lastAnswer = answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const recentAnswers = answers.slice(0, 5).map((a) => ({
      id: a.id,
      questionId: a.questionId,
      answer: a.answer,
      createdAt: a.createdAt.toISOString(),
    }));

    // Enforce timezone-aware calendar lockout based on client offset
    const tzOffsetHeader = req.headers['x-timezone-offset'];
    const timezoneOffset = tzOffsetHeader ? parseInt(tzOffsetHeader as string, 10) : 0;
    const lockStatus = getJourneyLockStatus(answeredQuestions, lastAnswer, timezoneOffset);
    const unlockedAt = lockStatus.unlockedAt;

    // Calculate category completion
    const categoryCounts: Record<string, number> = {};
    for (const a of answers) {
      const q = questions.find(q => q.id === a.questionId);
      if (q) {
        categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
      }
    }
    const categoryProgress = {
      "Family Values": Math.min(100, Math.round(((categoryCounts["Family Values"] || 0) / 30) * 100)),
      "Communication Style": Math.min(100, Math.round(((categoryCounts["Communication Style"] || 0) / 30) * 100)),
      "Career Goals": Math.min(100, Math.round(((categoryCounts["Career Goals"] || 0) / 30) * 100)),
      "Lifestyle": Math.min(100, Math.round(((categoryCounts["Lifestyle"] || 0) / 30) * 100)),
      "Personality": Math.min(100, Math.round(((categoryCounts["Personality"] || 0) / 30) * 100)),
    };

    const dayQs = questions.filter(q => q.day === currentDay);
    const answeredTodayCount = dayQs.filter(q => answers.some(a => a.questionId === q.id)).length;
    const questionsRemainingToday = dayQs.length - answeredTodayCount;

    const calculatedStreak = Math.min(currentDay, 30);

    return res.json({
      totalQuestions,
      answeredQuestions,
      currentDay,
      completionPercentage,
      streak: calculatedStreak,
      lastAnsweredAt: lastAnswer?.createdAt.toISOString() ?? null,
      unlockedAt,
      recentAnswers,
      categoryProgress,
      questionsRemainingToday: unlockedAt && new Date(unlockedAt) > new Date() ? 0 : questionsRemainingToday,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: err instanceof Error ? String(err) + ' ' + (err.stack || '') : String(err) }); }
});

// POST /journey/answers
router.post("/answers", authenticate, async (req: AuthRequest, res) => {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || !answer) return res.status(400).json({ error: "questionId and answer required" });

    // Enforce lockout check
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, req.user!.userId));
    const lastAnswer = answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const tzOffsetHeader = req.headers['x-timezone-offset'];
    const timezoneOffset = tzOffsetHeader ? parseInt(tzOffsetHeader as string, 10) : 0;
    const lockStatus = getJourneyLockStatus(answers.length, lastAnswer, timezoneOffset);
    if (lockStatus.isLocked) {
      return res.status(403).json({ error: "Next day's questions are locked until midnight." });
    }

    // Sequence validation: Ensure the question belongs to the first incomplete day
    const answeredIds = new Set(answers.map((a) => a.questionId));
    const allActiveQuestions = await db.select().from(journeyQuestionsTable).where(eq(journeyQuestionsTable.isActive, true)).orderBy(journeyQuestionsTable.id);
    let currentDay = 1;
    for (let d = 1; d <= 30; d++) {
      currentDay = d;
      const dayQs = allActiveQuestions.filter(q => q.day === d);
      if (dayQs.length === 0) continue;
      const allAnswered = dayQs.every(q => answeredIds.has(q.id));
      if (!allAnswered) {
        break;
      }
    }

    const question = allActiveQuestions.find(q => q.id === questionId);
    if (!question || question.day !== currentDay) {
      return res.status(400).json({ error: "Questions must be answered in sequence. You cannot skip days." });
    }

    const existing = await db.query.journeyAnswersTable.findFirst({
      where: and(eq(journeyAnswersTable.userId, req.user!.userId), eq(journeyAnswersTable.questionId, questionId)),
    });
    if (existing) return res.status(409).json({ error: "Already answered this question" });

    const [created] = await db.insert(journeyAnswersTable).values({
      userId: req.user!.userId, questionId, answer,
    }).returning();

    // SCORING LOGIC - Rebuild the full profile from scratch using the new centralized generator
    await generateFullUserProfile(req.user!.userId);

    // Update progress counter
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    await db.update(usersTable).set({
      journeyProgress: (user?.journeyProgress ?? 0) + 1,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, req.user!.userId));

    return res.status(201).json({
      id: created.id,
      questionId: created.questionId,
      answer: created.answer,
      createdAt: created.createdAt.toISOString(),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: err instanceof Error ? String(err) + ' ' + (err.stack || '') : String(err) }); }
});

// PUT /journey/answers/:questionId
router.put("/answers/:questionId", authenticate, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.params.questionId as string);
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ error: "answer required" });

    const [updated] = await db.update(journeyAnswersTable).set({ answer, updatedAt: new Date() })
      .where(and(eq(journeyAnswersTable.userId, req.user!.userId), eq(journeyAnswersTable.questionId, questionId)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Answer not found" });
    return res.json({ id: updated.id, questionId: updated.questionId, answer: updated.answer, createdAt: updated.createdAt.toISOString() });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: err instanceof Error ? String(err) + ' ' + (err.stack || '') : String(err) }); }
});



// GET /journey/daily-poll
router.get("/daily-poll", authenticate, async (req: AuthRequest, res) => {
  try {
    const answers = await db.select().from(dailyPollAnswersTable).where(eq(dailyPollAnswersTable.userId, req.user!.userId)).orderBy(dailyPollAnswersTable.createdAt);
    const lastAnswer = answers.length > 0 ? answers[answers.length - 1] : null;
    
    let unlockedAt = null;
    let isLocked = false;
    
    if (lastAnswer) {
      const createdAt = new Date(lastAnswer.createdAt);
      let adjustedCreatedAt = createdAt;
      if (Date.now() - createdAt.getTime() < 0) {
         adjustedCreatedAt = new Date(createdAt.getTime() + createdAt.getTimezoneOffset() * 60000);
      }
      let unlockTime = new Date(adjustedCreatedAt.getTime() + 24 * 60 * 60 * 1000);
      
      if (unlockTime.getTime() > Date.now()) {
        unlockedAt = unlockTime.toISOString();
        isLocked = true;
      }
    }

    const nextPollId = (answers.length % 100) + 1; // 1 to 100
    const poll = dailyPollsCache.find(p => p.id === nextPollId) || dailyPollsCache[0];
    
    let lastPoll = null;
    if (lastAnswer) {
      lastPoll = dailyPollsCache.find(p => p.id === lastAnswer.pollId) || null;
    }

    return res.json({
      poll: isLocked ? null : poll,
      lastPoll,
      isLocked,
      unlockedAt,
      totalAnswered: answers.length,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: String(err) }); }
});

// POST /journey/daily-poll
router.post("/daily-poll", authenticate, async (req: AuthRequest, res) => {
  try {
    const { pollId, answer } = req.body;
    if (!pollId || !answer) return res.status(400).json({ error: "pollId and answer are required" });

    const answers = await db.select().from(dailyPollAnswersTable).where(eq(dailyPollAnswersTable.userId, req.user!.userId)).orderBy(dailyPollAnswersTable.createdAt);
    const lastAnswer = answers.length > 0 ? answers[answers.length - 1] : null;
    
    if (lastAnswer) {
      const createdAt = new Date(lastAnswer.createdAt);
      let adjustedCreatedAt = createdAt;
      if (Date.now() - createdAt.getTime() < 0) {
         adjustedCreatedAt = new Date(createdAt.getTime() + createdAt.getTimezoneOffset() * 60000);
      }
      let unlockTime = new Date(adjustedCreatedAt.getTime() + 24 * 60 * 60 * 1000);
      if (unlockTime.getTime() > Date.now()) {
        return res.status(403).json({ error: "You must wait 24 hours before answering the next poll.", unlockedAt: unlockTime.toISOString() });
      }
    }

    await db.insert(dailyPollAnswersTable).values({
      userId: req.user!.userId,
      pollId,
      answer,
    });

    return res.json({ success: true });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: String(err) }); }
});

// GET /journey/personality
router.get("/personality", authenticate, async (req: AuthRequest, res) => {
  try {
    const profile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, req.user!.userId) });
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, req.user!.userId));

    if (profile) {
      return res.json({
        traits: profile.traits ? JSON.parse(profile.traits) : [],
        behavioralTraits: profile.behavioralTraits ? JSON.parse(profile.behavioralTraits) : {},
        questionnaireCategoryScores: profile.questionnaireCategoryScores ? JSON.parse(profile.questionnaireCategoryScores) : {},
        storyCategoryScores: profile.storyCategoryScores ? JSON.parse(profile.storyCategoryScores) : {},
        finalUnifiedCategoryScores: profile.finalUnifiedCategoryScores ? JSON.parse(profile.finalUnifiedCategoryScores) : {},
        summary: profile.summary || "Your personality profile is actively being generated based on your daily answers.",
        compatibilityKeywords: profile.compatibilityKeywords || [],
        dominantType: profile.dominantType || "Developing...",
        generatedAt: profile.generatedAt?.toISOString() ?? null,
      });
    }

    // If they haven't answered any questions yet
    return res.json({
      traits: [],
      behavioralTraits: {},
      questionnaireCategoryScores: {},
      storyCategoryScores: {},
      finalUnifiedCategoryScores: {},
      summary: "Start your 30-Day Journey to uncover your deep personality profile.",
      compatibilityKeywords: [],
      dominantType: "Unknown",
      generatedAt: null,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: err instanceof Error ? String(err) + ' ' + (err.stack || '') : String(err) }); }
});

export default router;
