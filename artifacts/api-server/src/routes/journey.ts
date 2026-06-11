import { Router } from "express";
import { db } from "@workspace/db";
import { journeyQuestionsTable, journeyAnswersTable, personalityProfilesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";

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
    const questions = await db.select().from(journeyQuestionsTable).where(eq(journeyQuestionsTable.isActive, true));
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, req.user!.userId));
    const answeredIds = new Set(answers.map((a) => a.questionId));

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
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
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
    const currentDay = user?.journeyProgress ?? 0;

    const lastAnswer = answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const recentAnswers = answers.slice(0, 5).map((a) => ({
      id: a.id,
      questionId: a.questionId,
      answer: a.answer,
      createdAt: a.createdAt.toISOString(),
    }));

    return res.json({
      totalQuestions,
      answeredQuestions,
      currentDay,
      completionPercentage,
      streak: Math.min(currentDay, 7),
      lastAnsweredAt: lastAnswer?.createdAt.toISOString() ?? null,
      unlockedAt: null,
      recentAnswers,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /journey/answers
router.post("/answers", authenticate, async (req: AuthRequest, res) => {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || !answer) return res.status(400).json({ error: "questionId and answer required" });

    const existing = await db.query.journeyAnswersTable.findFirst({
      where: and(eq(journeyAnswersTable.userId, req.user!.userId), eq(journeyAnswersTable.questionId, questionId)),
    });
    if (existing) return res.status(409).json({ error: "Already answered this question" });

    const [created] = await db.insert(journeyAnswersTable).values({
      userId: req.user!.userId, questionId, answer,
    }).returning();

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
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
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
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /journey/personality
router.get("/personality", authenticate, async (req: AuthRequest, res) => {
  try {
    const profile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, req.user!.userId) });
    const answers = await db.select().from(journeyAnswersTable).where(eq(journeyAnswersTable.userId, req.user!.userId));

    if (profile && answers.length >= 10) {
      return res.json({
        traits: JSON.parse(profile.traits || "[]"),
        summary: profile.summary || "Your personality profile is being generated.",
        compatibilityKeywords: profile.compatibilityKeywords || [],
        dominantType: profile.dominantType,
        generatedAt: profile.generatedAt?.toISOString() ?? null,
      });
    }

    // Generate synthetic personality (would use OpenAI in production)
    const traits = PERSONALITY_TRAITS.map((t) => ({
      trait: t.trait,
      score: Math.floor(Math.random() * 30 + 60),
      description: t.description,
    }));

    const dominant = traits.reduce((a, b) => a.score > b.score ? a : b);
    const summary = `You are a ${dominant.trait.toLowerCase()} individual with a strong sense of purpose and connection. You value authentic relationships built on trust and mutual understanding. Your communication style is thoughtful and your emotional intelligence guides meaningful interactions.`;

    await db.insert(personalityProfilesTable).values({
      userId: req.user!.userId,
      traits: JSON.stringify(traits),
      summary,
      compatibilityKeywords: ["empathy", "commitment", "growth", "trust", "communication"],
      dominantType: dominant.trait,
      generatedAt: new Date(),
    }).onConflictDoUpdate({
      target: personalityProfilesTable.userId,
      set: { traits: JSON.stringify(traits), summary, generatedAt: new Date() },
    });

    return res.json({
      traits,
      summary,
      compatibilityKeywords: ["empathy", "commitment", "growth", "trust", "communication"],
      dominantType: dominant.trait,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
