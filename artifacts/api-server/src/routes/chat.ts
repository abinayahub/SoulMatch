import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, usersTable } from "@workspace/db";
import { eq, or, and, lt, desc } from "drizzle-orm";
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
    if (!user || !isPremium(user.role)) {
      return res.status(403).json({ error: "Premium subscription required for chat" });
    }

    const conversations = await db.select().from(conversationsTable).where(
      or(eq(conversationsTable.user1Id, req.user!.userId), eq(conversationsTable.user2Id, req.user!.userId)),
    );

    const enriched = await Promise.all(conversations.map(async (c) => {
      const otherId = c.user1Id === req.user!.userId ? c.user2Id : c.user1Id;
      const otherUser = await buildPublicProfile(otherId);
      const lastMsgArr = await db.select().from(messagesTable)
        .where(eq(messagesTable.conversationId, c.id)).orderBy(desc(messagesTable.createdAt)).limit(1);
      const lastMsg = lastMsgArr[0];
      const unreadCount = 0;

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
    if (!user || !isPremium(user.role)) {
      return res.status(403).json({ error: "Premium subscription required for chat" });
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
      .where(and(eq(messagesTable.conversationId, convId)));
    return res.json({ message: "Marked as read" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
