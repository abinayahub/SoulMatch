import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, or, and, lt, desc, ne, sql } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { buildPublicProfile } from "../lib/helpers";

const router = Router();

function isPremium(role: string) {
  return role === "premium" || role === "admin" || role === "superadmin";
}

// GET /chat/conversations
router.get("/conversations", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isCompleted = user.journeyCompleted || (user.journeyProgress || 0) >= 30;
    if (!isCompleted) {
      return res.status(403).json({ error: "Complete your journey before chatting." });
    }

    const conversations = await db.select().from(conversationsTable).where(
      or(eq(conversationsTable.user1Id, req.user!.userId), eq(conversationsTable.user2Id, req.user!.userId)),
    );

    const enriched = await Promise.all(conversations.map(async (c) => {
      const otherId = c.user1Id === req.user!.userId ? c.user2Id : c.user1Id;
      const otherUser = await buildPublicProfile(otherId, req.user!.userId);
      const lastMsgArr = await db.select().from(messagesTable)
        .where(eq(messagesTable.conversationId, c.id)).orderBy(desc(messagesTable.createdAt)).limit(1);
      const lastMsg = lastMsgArr[0];
      const unreadResult = await db.select({ count: sql<number>`count(*)` }).from(messagesTable)
        .where(and(
          eq(messagesTable.conversationId, c.id),
          eq(messagesTable.isRead, false),
          ne(messagesTable.senderId, req.user!.userId)
        ));
      const unreadCount = Number(unreadResult[0].count || 0);

      return {
        id: c.id,
        participants: [otherUser],
        lastMessage: lastMsg ? {
          id: lastMsg.id, conversationId: lastMsg.conversationId, senderId: lastMsg.senderId,
          content: lastMsg.content, messageType: lastMsg.messageType, isRead: lastMsg.isRead,
          createdAt: lastMsg.createdAt.toISOString(),
        } : null,
        unreadCount,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    }));

    return res.json(enriched);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /chat/conversations/:conversationId/messages
router.get("/conversations/:conversationId/messages", authenticate, async (req: AuthRequest, res) => {
  try {
    const convId = parseInt(req.params.conversationId as string);
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before ? parseInt(req.query.before as string) : undefined;

    const conv = await db.query.conversationsTable.findFirst({ where: eq(conversationsTable.id, convId) });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (conv.user1Id !== req.user!.userId && conv.user2Id !== req.user!.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let query = db.select().from(messagesTable).where(eq(messagesTable.conversationId, convId));
    if (before) {
      query = db.select().from(messagesTable).where(and(eq(messagesTable.conversationId, convId), lt(messagesTable.id, before)));
    }

    const messages = await query.orderBy(desc(messagesTable.createdAt)).limit(limit);
    return res.json(messages.reverse().map((m) => ({
      id: m.id, conversationId: m.conversationId, senderId: m.senderId,
      content: m.content, messageType: m.messageType, isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /chat/conversations/:conversationId/messages
router.post("/conversations/:conversationId/messages", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const convId = parseInt(req.params.conversationId as string);
    const { content, messageType } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    const conv = await db.query.conversationsTable.findFirst({ where: eq(conversationsTable.id, convId) });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (conv.user1Id !== req.user!.userId && conv.user2Id !== req.user!.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [msg] = await db.insert(messagesTable).values({
      conversationId: convId, senderId: req.user!.userId,
      content, messageType: messageType || "text", isRead: false,
    }).returning();

    await db.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, convId));

    return res.status(201).json({
      id: msg.id, conversationId: msg.conversationId, senderId: msg.senderId,
      content: msg.content, messageType: msg.messageType, isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /chat/conversations/:conversationId/read
router.post("/conversations/:conversationId/read", authenticate, async (req: AuthRequest, res) => {
  try {
    const convId = parseInt(req.params.conversationId as string);
    await db.update(messagesTable).set({ isRead: true })
      .where(and(
        eq(messagesTable.conversationId, convId),
        ne(messagesTable.senderId, req.user!.userId)
      ));
    return res.json({ message: "Marked as read" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /chat/direct
router.post("/direct", authenticate, async (req: AuthRequest, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ error: "toUserId required" });

    // Check if conversation already exists
    const existing = await db.query.conversationsTable.findFirst({
      where: or(
        and(eq(conversationsTable.user1Id, req.user!.userId), eq(conversationsTable.user2Id, toUserId)),
        and(eq(conversationsTable.user1Id, toUserId), eq(conversationsTable.user2Id, req.user!.userId))
      )
    });

    if (existing) {
      return res.json(existing);
    }

    // Create new conversation
    const [conv] = await db.insert(conversationsTable).values({
      user1Id: req.user!.userId,
      user2Id: toUserId,
    }).returning();

    return res.status(201).json(conv);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /chat/conversations/:conversationId/call
router.post("/conversations/:conversationId/call", authenticate, async (req: AuthRequest, res) => {
  try {
    const convId = parseInt(req.params.conversationId as string);
    const { type } = req.body; // "audio" or "video"

    const conv = await db.query.conversationsTable.findFirst({ where: eq(conversationsTable.id, convId) });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const receiverId = conv.user1Id === req.user!.userId ? conv.user2Id : conv.user1Id;

    // Insert a call notification for the receiver
    await db.insert(notificationsTable).values({
      userId: receiverId,
      actorId: req.user!.userId,
      type: "call",
      title: "Incoming Call",
      body: `You have an incoming ${type} call.`,
      actionUrl: `/chat/${convId}?action=answer_${type}`,
      isRead: false,
    });

    return res.json({ message: "Call initiated" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
