import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, usersTable } from "@workspace/db";
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

    const currentUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    const oppositeGender = currentUser?.gender === "male" ? "female" : currentUser?.gender === "female" ? "male" : null;

    const conditions = unreadOnly
      ? and(eq(notificationsTable.userId, req.user!.userId), eq(notificationsTable.isRead, false))
      : eq(notificationsTable.userId, req.user!.userId);

    const notifications = await db.select({
      notification: notificationsTable,
      actorGender: usersTable.gender
    })
      .from(notificationsTable)
      .leftJoin(usersTable, eq(usersTable.id, notificationsTable.actorId))
      .where(conditions)
      .orderBy(desc(notificationsTable.createdAt));

    // Filter out notifications from same gender (unless system notifications where actorId is null, or it is a direct interaction like call/message)
    let filtered = notifications.filter(({ notification, actorGender }) => 
      !notification.actorId || 
      !oppositeGender || 
      actorGender === oppositeGender ||
      notification.type === "call" ||
      notification.type === "message"
    );
    
    // Manual pagination after filtering
    const paginated = filtered.slice(offset, offset + limit);
    const unreadCount = filtered.filter(n => !n.notification.isRead).length;

    // Only enrich the paginated results to avoid N+1 queries on everything
    const enrichedPaginated = await Promise.all(paginated.map(async ({ notification: n, actorGender }) => {
      return {
        id: n.id, type: n.type, title: n.title, body: n.body, isRead: n.isRead,
        actionUrl: n.actionUrl,
        actorId: n.actorId,
        actorGender,
        actor: n.actorId ? await buildPublicProfile(n.actorId) : null,
        createdAt: n.createdAt.toISOString(),
      };
    }));

    return res.json({
      notifications: enrichedPaginated,
      total: filtered.length,
      unreadCount,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /notifications/count
router.get("/count", authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, req.user!.userId) });
    const oppositeGender = currentUser?.gender === "male" ? "female" : currentUser?.gender === "female" ? "male" : null;

    const notifications = await db.select({
      notification: notificationsTable,
      actorGender: usersTable.gender
    })
      .from(notificationsTable)
      .leftJoin(usersTable, eq(usersTable.id, notificationsTable.actorId))
      .where(and(eq(notificationsTable.userId, req.user!.userId), eq(notificationsTable.isRead, false)));
    
    let unreadCount = 0;
    for (const { notification: n, actorGender } of notifications) {
      if (!n.actorId || n.type === "call" || n.type === "message") {
        unreadCount++;
      } else {
        if (!oppositeGender || actorGender === oppositeGender) {
          unreadCount++;
        }
      }
    }
    
    return res.json({ count: unreadCount });
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
