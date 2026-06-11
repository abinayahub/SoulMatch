import { Router } from "express";
import { db } from "@workspace/db";
import { reportsTable, blockedUsersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";
import { buildPublicProfile } from "../lib/helpers";

const router = Router();

// POST /reports
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    if (!reportedUserId || !reason) return res.status(400).json({ error: "reportedUserId and reason required" });

    await db.insert(reportsTable).values({
      reporterUserId: req.user!.userId,
      reportedUserId,
      reason,
      description: description || null,
    });

    return res.status(201).json({ message: "Report submitted successfully" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /reports/block
router.post("/block", authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const existing = await db.query.blockedUsersTable.findFirst({
      where: and(eq(blockedUsersTable.blockerId, req.user!.userId), eq(blockedUsersTable.blockedId, userId)),
    });
    if (existing) return res.status(409).json({ error: "User already blocked" });

    await db.insert(blockedUsersTable).values({ blockerId: req.user!.userId, blockedId: userId });
    return res.json({ message: "User blocked successfully" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /reports/blocked
router.get("/blocked", authenticate, async (req: AuthRequest, res) => {
  try {
    const blocked = await db.select().from(blockedUsersTable).where(eq(blockedUsersTable.blockerId, req.user!.userId));
    const profiles = await Promise.all(blocked.map((b) => buildPublicProfile(b.blockedId)));
    return res.json(profiles.filter(Boolean));
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
