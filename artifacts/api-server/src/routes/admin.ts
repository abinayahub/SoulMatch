import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, reportsTable, verificationsTable, subscriptionsTable } from "@workspace/db";
import { eq, ilike, or, desc, count, and } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../lib/auth";

const router = Router();

const isAdmin = [authenticate, requireRole("admin", "superadmin")];

// GET /admin/users
router.get("/users", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let users = await db.select().from(usersTable).limit(limit).offset(offset);

    if (search) {
      users = users.filter((u) =>
        u.email.includes(search) || u.firstName.includes(search) || u.lastName.includes(search)
      );
    }

    const [totalResult] = await db.select({ count: count() }).from(usersTable);

    return res.json({
      users: users.map((u) => ({
        id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName,
        role: u.role, status: u.status, verificationStatus: u.verificationStatus,
        isPremium: u.role === "premium" || u.role === "admin",
        subscriptionPlan: u.role === "premium" ? "premium_monthly" : null,
        reportCount: 0, lastActive: u.lastActive?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(), journeyProgress: u.journeyProgress,
      })),
      total: Number(totalResult.count),
      page,
      totalPages: Math.ceil(Number(totalResult.count) / limit),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/users/:userId
router.get("/users/:userId", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId as string);
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      role: user.role, status: user.status, verificationStatus: user.verificationStatus,
      isPremium: user.role === "premium",
      subscriptionPlan: user.role === "premium" ? "premium_monthly" : null,
      reportCount: 0, lastActive: user.lastActive?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(), journeyProgress: user.journeyProgress,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /admin/users/:userId
router.patch("/users/:userId", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId as string);
    const { role, status } = req.body;

    const [updated] = await db.update(usersTable).set({
      ...(role && { role }), ...(status && { status }), updatedAt: new Date(),
    }).where(eq(usersTable.id, userId)).returning();

    if (!updated) return res.status(404).json({ error: "User not found" });

    return res.json({
      id: updated.id, email: updated.email, firstName: updated.firstName, lastName: updated.lastName,
      role: updated.role, status: updated.status, verificationStatus: updated.verificationStatus,
      isPremium: updated.role === "premium", subscriptionPlan: null, reportCount: 0,
      lastActive: updated.lastActive?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(), journeyProgress: updated.journeyProgress,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/reports
router.get("/reports", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    const reports = await db.select().from(reportsTable).orderBy(desc(reportsTable.createdAt)).limit(limit).offset(offset);
    const [totalResult] = await db.select({ count: count() }).from(reportsTable);

    const { buildPublicProfile } = await import("../lib/helpers");
    const enriched = await Promise.all(reports.map(async (r) => ({
      id: r.id, reason: r.reason, status: r.status, description: r.description,
      reporterUserId: r.reporterUserId, reportedUserId: r.reportedUserId,
      resolution: r.resolution,
      reporter: await buildPublicProfile(r.reporterUserId),
      reported: await buildPublicProfile(r.reportedUserId),
      createdAt: r.createdAt.toISOString(),
    })));

    return res.json({
      reports: enriched, total: Number(totalResult.count), page,
      totalPages: Math.ceil(Number(totalResult.count) / limit),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /admin/reports/:reportId
router.patch("/reports/:reportId", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const reportId = parseInt(req.params.reportId as string);
    const { status, resolution, actionTaken } = req.body;

    await db.update(reportsTable).set({
      status, resolution: resolution || null, actionTaken: actionTaken || null,
      updatedAt: new Date(),
    }).where(eq(reportsTable.id, reportId));

    return res.json({ message: "Report resolved" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/verifications
router.get("/verifications", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const verifications = await db.select().from(verificationsTable).where(eq(verificationsTable.status, "pending")).orderBy(desc(verificationsTable.createdAt));
    const { buildPublicProfile } = await import("../lib/helpers");
    const enriched = await Promise.all(verifications.map(async (v) => ({
      id: v.id, userId: v.userId, documentType: v.documentType,
      documentUrl: v.documentUrl, selfieUrl: v.selfieUrl, status: v.status,
      user: await buildPublicProfile(v.userId),
      createdAt: v.createdAt.toISOString(),
    })));
    return res.json(enriched);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /admin/verifications/:verificationId
router.patch("/verifications/:verificationId", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const verifId = parseInt(req.params.verificationId as string);
    const { status, rejectionReason } = req.body;

    const verif = await db.query.verificationsTable.findFirst({ where: eq(verificationsTable.id, verifId) });
    if (!verif) return res.status(404).json({ error: "Verification not found" });

    await db.update(verificationsTable).set({
      status, rejectionReason: rejectionReason || null, reviewedAt: new Date(),
    }).where(eq(verificationsTable.id, verifId));

    await db.update(usersTable).set({
      verificationStatus: status === "approved" ? "verified" : "rejected",
      updatedAt: new Date(),
    }).where(eq(usersTable.id, verif.userId));

    return res.json({ message: `Verification ${status}` });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
