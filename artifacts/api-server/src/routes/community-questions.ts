import { Router } from "express";
import { db } from "@workspace/db";
import { communityQuestionsTable, communityAnswersTable, usersTable, notificationsTable, compatibilityScoresTable } from "@workspace/db/schema";
import { authenticate, AuthRequest } from "../lib/auth";
import { eq, desc, and, ne, notInArray, isNotNull, or } from "drizzle-orm";

const router = Router();

// Get the authenticated user's submitted questions
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const questions = await db
      .select()
      .from(communityQuestionsTable)
      .where(eq(communityQuestionsTable.userId, req.user!.userId))
      .orderBy(desc(communityQuestionsTable.createdAt));

    res.json(questions);
  } catch (error) {
    console.error("Error fetching community questions:", error);
    res.status(500).json({ message: "Failed to fetch questions." });
  }
});

// Get published community questions targeted for the user
router.get("/published", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // Fetch current user gender
    const userResult = await db.select({ gender: usersTable.gender }).from(usersTable).where(eq(usersTable.id, userId));
    const userGender = userResult[0]?.gender;
    if (!userGender) {
      return res.status(400).json({ message: "User gender not found." });
    }

    // Fetch questions the user has already answered
    const answered = await db
      .select({ questionId: communityAnswersTable.questionId })
      .from(communityAnswersTable)
      .where(eq(communityAnswersTable.userId, userId));
    const answeredIds = answered.map(a => a.questionId);

    // Build conditions: Approved, different gender, not created by user, not answered by user
    const conditions = [
      eq(communityQuestionsTable.status, "Approved"),
      ne(communityQuestionsTable.userId, userId),
      ne(communityQuestionsTable.userGender, userGender)
    ];

    if (answeredIds.length > 0) {
      conditions.push(notInArray(communityQuestionsTable.id, answeredIds));
    }

    const questions = await db
      .select()
      .from(communityQuestionsTable)
      .where(and(...conditions))
      .orderBy(desc(communityQuestionsTable.createdAt));

    res.json(questions);
  } catch (error) {
    console.error("Error fetching published community questions:", error);
    res.status(500).json({ message: "Failed to fetch questions." });
  }
});

// Get answers submitted by the logged-in user
router.get("/my-answers", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const answers = await db
      .select({
        id: communityAnswersTable.id,
        answer: communityAnswersTable.answer,
        createdAt: communityAnswersTable.createdAt,
        question: {
          id: communityQuestionsTable.id,
          text: communityQuestionsTable.text,
          category: communityQuestionsTable.category,
        }
      })
      .from(communityAnswersTable)
      .innerJoin(communityQuestionsTable, eq(communityAnswersTable.questionId, communityQuestionsTable.id))
      .where(eq(communityAnswersTable.userId, userId))
      .orderBy(desc(communityAnswersTable.createdAt));

    res.json(answers);
  } catch (error) {
    console.error("Error fetching user answers:", error);
    res.status(500).json({ message: "Failed to fetch user answers." });
  }
});

// Get a specific community question
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const [question] = await db.select().from(communityQuestionsTable).where(eq(communityQuestionsTable.id, questionId));
    
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: "Failed to fetch question." });
  }
});

// Post a new community question
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { text, category, isAnonymous } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text is required." });
    }

    const userId = req.user!.userId;
    const userResult = await db.select({ gender: usersTable.gender }).from(usersTable).where(eq(usersTable.id, userId));
    const userGender = userResult[0]?.gender || "unknown";

    const [question] = await db.insert(communityQuestionsTable).values({
      userId: userId,
      userGender: userGender,
      text,
      category: category || "others",
      isAnonymous: isAnonymous ?? false,
      status: "Pending",
    }).returning();

    res.status(201).json(question);
  } catch (error) {
    console.error("Error posting community question:", error);
    res.status(500).json({ message: "Failed to post question." });
  }
});

// Post an answer to a question
router.post("/:id/answers", authenticate, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ message: "Answer text is required." });
    }

    const [question] = await db.select().from(communityQuestionsTable).where(eq(communityQuestionsTable.id, questionId));
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }
    if (question.userId === userId) {
      return res.status(400).json({ message: "Cannot answer your own question." });
    }

    // Insert answer
    try {
      await db.insert(communityAnswersTable).values({
        questionId,
        userId,
        answer,
      });
    } catch (e: any) {
      if (e.code === '23505') { // unique violation
        return res.status(400).json({ message: "You have already answered this question." });
      }
      throw e;
    }

    // Increment answer count
    await db.update(communityQuestionsTable)
      .set({ answersCount: question.answersCount + 1 })
      .where(eq(communityQuestionsTable.id, questionId));

    // Send notification
    await db.insert(notificationsTable).values({
      userId: question.userId,
      actorId: userId,
      type: "system",
      title: "New Answer Received",
      body: "Someone answered your community question!",
      actionUrl: `/my-story`
    });

    // Asynchronously trigger compatibility calculation in the background
    (async () => {
      try {
        const { calculateAndStoreCompatibility } = await import("../lib/helpers");
        await calculateAndStoreCompatibility(null, null, question.userId, userId);
      } catch (err) {
        console.error("Failed to pre-compute compatibility:", err);
      }
    })();

    res.status(201).json({ message: "Answer submitted successfully." });
  } catch (error) {
    console.error("Error posting answer:", error);
    res.status(500).json({ message: "Failed to post answer." });
  }
});

// Get answers for a specific question (owner only)
router.get("/:id/answers", authenticate, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const userId = req.user!.userId;

    const [question] = await db.select().from(communityQuestionsTable).where(eq(communityQuestionsTable.id, questionId));
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }
    if (question.userId !== userId) {
      return res.status(403).json({ message: "Only the question owner can view the answers." });
    }

    const answers = await db
      .select({
        id: communityAnswersTable.id,
        answer: communityAnswersTable.answer,
        createdAt: communityAnswersTable.createdAt,
        compatibilityScore: compatibilityScoresTable.score,
        // Include user details (always for owner unless we want to hide it based on business rules, but requirement 3 says Name or Anonymous if required)
        user: {
          id: usersTable.id,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          displayName: usersTable.displayName,
          photoUrl: usersTable.selfieUrl,
        }
      })
      .from(communityAnswersTable)
      .leftJoin(usersTable, eq(usersTable.id, communityAnswersTable.userId))
      .leftJoin(compatibilityScoresTable, or(
        and(eq(compatibilityScoresTable.userAId, question.userId), eq(compatibilityScoresTable.userBId, communityAnswersTable.userId)),
        and(eq(compatibilityScoresTable.userAId, communityAnswersTable.userId), eq(compatibilityScoresTable.userBId, question.userId))
      ))
      .where(
        and(
          eq(communityAnswersTable.questionId, questionId),
          eq(communityAnswersTable.ignoredByOwner, false)
        )
      )
      .orderBy(desc(compatibilityScoresTable.score), desc(communityAnswersTable.createdAt));

    res.json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ message: "Failed to fetch answers." });
  }
});

// Ignore an answer
router.patch("/answers/:answerId/ignore", authenticate, async (req: AuthRequest, res) => {
  try {
    const answerId = parseInt(req.params.answerId);
    const userId = req.user!.userId;

    const [answer] = await db
      .select()
      .from(communityAnswersTable)
      .where(eq(communityAnswersTable.id, answerId));

    if (!answer) {
      return res.status(404).json({ message: "Answer not found." });
    }

    const [question] = await db
      .select()
      .from(communityQuestionsTable)
      .where(eq(communityQuestionsTable.id, answer.questionId));

    if (question.userId !== userId) {
      return res.status(403).json({ message: "Only the question owner can ignore answers." });
    }

    await db.update(communityAnswersTable)
      .set({ ignoredByOwner: true })
      .where(eq(communityAnswersTable.id, answerId));

    res.json({ message: "Answer ignored successfully." });
  } catch (error) {
    console.error("Error ignoring answer:", error);
    res.status(500).json({ message: "Failed to ignore answer." });
  }
});

export default router;
