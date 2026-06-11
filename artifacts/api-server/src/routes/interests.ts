import { Router } from "express";
import { db } from "@workspace/db";
import { interestsTable, notificationsTable } from "@workspace/db";
import { eq, and, or, count } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { buildPublicProfile } from "../lib/helpers";

const router = Router();

// GET /interests
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const type = req.query.type as string;
    const userId = req.user!.userId;

    let interests: typeof interestsTable.$inferSelect[] = [];

    if (type === "sent") {
      interests = await db.select().from(interestsTable).where(eq(interestsTable.fromUserId, userId));
    } else if (type === "received") {
      interests = await db.select().from(interestsTable).where(eq(interestsTable.toUserId, userId));
    } else if (type === "mutual") {
      interests = await db.select().from(interestsTable).where(
        and(eq(interestsTable.toUserId, userId), eq(interestsTable.status, "accepted")),
      );
    } else {
      interests = await db.select().from(interestsTable).where(
        or(eq(interestsTable.fromUserId, userId), eq(interestsTable.toUserId, userId)),
      );
    }

    const enriched = await Promise.all(interests.map(async (i) => {
      const fromUser = await buildPublicProfile(i.fromUserId);
      const toUser = await buildPublicProfile(i.toUserId);
      return {
        id: i.id,
        fromUserId: i.fromUserId,
        toUserId: i.toUserId,
        status: i.status,
        message: i.message,
        createdAt: i.createdAt.toISOString(),
        fromUser,
        toUser,
      };
    }));

    return res.json(enriched);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /interests/summary
router.get("/summary", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const [pending] = await db.select({ count: count() }).from(interestsTable)
      .where(and(eq(interestsTable.toUserId, userId), eq(interestsTable.status, "pending")));
    const [sent] = await db.select({ count: count() }).from(interestsTable).where(eq(interestsTable.fromUserId, userId));
    const [mutual] = await db.select({ count: count() }).from(interestsTable)
      .where(and(eq(interestsTable.toUserId, userId), eq(interestsTable.status, "accepted")));
    const [received] = await db.select({ count: count() }).from(interestsTable).where(eq(interestsTable.toUserId, userId));

    return res.json({
      pendingReceived: Number(pending.count),
      totalSent: Number(sent.count),
      mutualCount: Number(mutual.count),
      acceptanceRate: Number(received.count) > 0 ? Number(mutual.count) / Number(received.count) : 0,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /interests
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { toUserId, message } = req.body;
    if (!toUserId) return res.status(400).json({ error: "toUserId required" });
    if (toUserId === req.user!.userId) return res.status(400).json({ error: "Cannot send interest to yourself" });

    const existing = await db.query.interestsTable.findFirst({
      where: and(eq(interestsTable.fromUserId, req.user!.userId), eq(interestsTable.toUserId, toUserId)),
    });
    if (existing) return res.status(409).json({ error: "Interest already sent" });

    const [interest] = await db.insert(interestsTable).values({
      fromUserId: req.user!.userId, toUserId, message: message || null, status: "pending",
    }).returning();

    await db.insert(notificationsTable).values({
      userId: toUserId, actorId: req.user!.userId,
      type: "interest", title: "New Interest Received",
      body: "Someone has sent you an interest. Check your profile!",
      actionUrl: "/interests",
    });

    const fromUser = await buildPublicProfile(interest.fromUserId);
    const toUser = await buildPublicProfile(interest.toUserId);
    return res.status(201).json({ id: interest.id, fromUserId: interest.fromUserId, toUserId: interest.toUserId, status: interest.status, message: interest.message, createdAt: interest.createdAt.toISOString(), fromUser, toUser });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /interests/:interestId
router.patch("/:interestId", authenticate, async (req: AuthRequest, res) => {
  try {
    const interestId = parseInt(req.params.interestId as string);
    const { action } = req.body;
    if (!action || !["accept", "decline"].includes(action)) return res.status(400).json({ error: "action must be 'accept' or 'decline'" });

    const interest = await db.query.interestsTable.findFirst({ where: eq(interestsTable.id, interestId) });
    if (!interest) return res.status(404).json({ error: "Interest not found" });
    if (interest.toUserId !== req.user!.userId) return res.status(403).json({ error: "Forbidden" });

    const [updated] = await db.update(interestsTable).set({
      status: action === "accept" ? "accepted" : "declined",
      updatedAt: new Date(),
    }).where(eq(interestsTable.id, interestId)).returning();

    if (action === "accept") {
      await db.insert(notificationsTable).values({
        userId: interest.fromUserId, actorId: req.user!.userId,
        type: "match", title: "Interest Accepted!",
        body: "Great news! Someone accepted your interest. You can now chat with them.",
        actionUrl: "/chat",
      });
    }

    const fromUser = await buildPublicProfile(updated.fromUserId);
    const toUser = await buildPublicProfile(updated.toUserId);
    return res.json({ id: updated.id, fromUserId: updated.fromUserId, toUserId: updated.toUserId, status: updated.status, message: updated.message, createdAt: updated.createdAt.toISOString(), fromUser, toUser });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /interests/:interestId
router.delete("/:interestId", authenticate, async (req: AuthRequest, res) => {
  try {
    const interestId = parseInt(req.params.interestId as string);
    const interest = await db.query.interestsTable.findFirst({ where: eq(interestsTable.id, interestId) });
    if (!interest) return res.status(404).json({ error: "Interest not found" });
    if (interest.fromUserId !== req.user!.userId) return res.status(403).json({ error: "Forbidden" });
    await db.update(interestsTable).set({ status: "withdrawn", updatedAt: new Date() }).where(eq(interestsTable.id, interestId));
    return res.json({ message: "Interest withdrawn" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
