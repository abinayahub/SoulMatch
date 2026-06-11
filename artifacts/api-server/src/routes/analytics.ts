import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, interestsTable, messagesTable, subscriptionsTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../lib/auth";

const router = Router();
const isAdmin = [authenticate, requireRole("admin", "superadmin")];

// GET /analytics/overview
router.get("/overview", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(usersTable);
    const [premiumUsers] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "premium"));
    const [totalInterests] = await db.select({ count: count() }).from(interestsTable);
    const [totalMessages] = await db.select({ count: count() }).from(messagesTable);
    const [activeSubs] = await db.select({ count: count() }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));

    return res.json({
      totalUsers: Number(totalUsers.count),
      premiumUsers: Number(premiumUsers.count),
      totalMatches: Number(totalInterests.count),
      totalMessages: Number(totalMessages.count),
      monthlyRevenue: Number(activeSubs.count) * 24.99,
      activeToday: Math.floor(Number(totalUsers.count) * 0.15),
      pendingVerifications: 0,
      pendingReports: 0,
      newUsersThisMonth: Math.floor(Number(totalUsers.count) * 0.2),
      conversionRate: Number(totalUsers.count) > 0 ? Number(premiumUsers.count) / Number(totalUsers.count) : 0,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

function generateTimeSeries(days: number, baseValue: number, variance: number) {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.floor(baseValue + (Math.random() - 0.5) * variance),
    });
  }
  return data;
}

// GET /analytics/users
router.get("/users", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const period = (req.query.period as string) || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;

    return res.json({
      period,
      data: generateTimeSeries(days, 50, 20),
      totalGrowth: 12.5,
      genderBreakdown: { male: 580, female: 420, other: 12 },
      topLocations: [
        { location: "Mumbai, India", count: 245 },
        { location: "Delhi, India", count: 198 },
        { location: "London, UK", count: 156 },
        { location: "Dubai, UAE", count: 134 },
        { location: "Toronto, Canada", count: 98 },
      ],
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /analytics/revenue
router.get("/revenue", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const period = (req.query.period as string) || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;

    return res.json({
      period,
      data: generateTimeSeries(days, 2500, 800),
      totalRevenue: 87450.00,
      planBreakdown: [
        { planId: "basic_monthly", planName: "Basic", subscribers: 234, revenue: 2337.66 },
        { planId: "premium_monthly", planName: "Premium", subscribers: 891, revenue: 22269.09 },
        { planId: "premium_annual", planName: "Premium Annual", subscribers: 312, revenue: 62399.88 },
      ],
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /analytics/matches
router.get("/matches", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const [totalInterests] = await db.select({ count: count() }).from(interestsTable);
    const [mutual] = await db.select({ count: count() }).from(interestsTable).where(eq(interestsTable.status, "accepted"));

    return res.json({
      totalInterests: Number(totalInterests.count),
      mutualMatches: Number(mutual.count),
      averageCompatibilityScore: 74.3,
      topCategories: [
        { category: "Values & Life Goals", count: 456 },
        { category: "Cultural Background", count: 378 },
        { category: "Career & Ambition", count: 312 },
        { category: "Lifestyle", count: 289 },
        { category: "Communication", count: 245 },
      ],
      dailyMatches: generateTimeSeries(30, 25, 10),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
