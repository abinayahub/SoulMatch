import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { buildPublicProfile } from "../lib/helpers";

const router = Router();

// GET /notifications
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const unreadOnly = req.query.unreadOnly === "true";
    const limit = 20;
    const offset = (page - 1) * limit;

    const conditions = unreadOnly
      ? and(eq(notificationsTable.userId, req.user!.userId), eq(notificationsTable.isRead, false))
      : eq(notificationsTable.userId, req.user!.userId);

    const notifications = await db.select().from(notificationsTable)
      .where(conditions).orderBy(desc(notificationsTable.createdAt)).limit(limit).offset(offset);

    const [totalResult] = await db.select({ count: count() }).from(notificationsTable).where(conditions);
    const [unreadResult] = await db.select({ count: count() }).from(notificationsTable)
      .where(and(eq(notificationsTable.userId, req.user!.userId), eq(notificationsTable.isRead, false)));

    const enriched = await Promise.all(notifications.map(async (n) => ({
      id: n.id, type: n.type, title: n.title, body: n.body, isRead: n.isRead,
      actionUrl: n.actionUrl,
      actorId: n.actorId,
      actor: n.actorId ? await buildPublicProfile(n.actorId) : null,
      createdAt: n.createdAt.toISOString(),
    })));

    return res.json({
      notifications: enriched,
      total: Number(totalResult.count),
      unreadCount: Number(unreadResult.count),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /notifications/count
router.get("/count", authenticate, async (req: AuthRequest, res) => {
  try {
    const [result] = await db.select({ count: count() }).from(notificationsTable)
      .where(and(eq(notificationsTable.userId, req.user!.userId), eq(notificationsTable.isRead, false)));
    return res.json({ count: Number(result.count) });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /notifications/read-all
router.post("/read-all", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, req.user!.userId));
    return res.json({ message: "All notifications marked as read" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /notifications/:notificationId/read
router.post("/:notificationId/read", authenticate, async (req: AuthRequest, res) => {
  try {
    const notifId = parseInt(req.params.notificationId as string);
    await db.update(notificationsTable).set({ isRead: true })
      .where(and(eq(notificationsTable.id, notifId), eq(notificationsTable.userId, req.user!.userId)));
    return res.json({ message: "Notification marked as read" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
