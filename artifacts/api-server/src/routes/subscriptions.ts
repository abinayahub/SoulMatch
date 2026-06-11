import { Router } from "express";
import { db } from "@workspace/db";
import { subscriptionsTable, rewardsTable, rewardTransactionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";

const router = Router();

const PLANS = [
  {
    id: "basic_monthly",
    name: "Basic",
    price: 9.99,
    currency: "USD",
    interval: "month",
    isPopular: false,
    stripePriceId: "price_basic_monthly",
    features: [
      "Unlimited profile views",
      "Send up to 10 interests/day",
      "Basic match recommendations",
      "Profile visibility boost",
    ],
  },
  {
    id: "premium_monthly",
    name: "Premium",
    price: 24.99,
    currency: "USD",
    interval: "month",
    isPopular: true,
    stripePriceId: "price_premium_monthly",
    features: [
      "Everything in Basic",
      "Unlimited interests",
      "AI-powered matching",
      "Real-time chat",
      "See who viewed you",
      "Priority in search results",
      "Read receipts",
    ],
  },
  {
    id: "premium_annual",
    name: "Premium Annual",
    price: 199.99,
    currency: "USD",
    interval: "year",
    isPopular: false,
    stripePriceId: "price_premium_annual",
    features: [
      "Everything in Premium Monthly",
      "Save 33% vs monthly",
      "Dedicated relationship coach",
      "Profile review by experts",
      "VIP support",
    ],
  },
];

// GET /subscriptions/plans
router.get("/plans", async (_req, res) => {
  return res.json(PLANS);
});

// GET /subscriptions/current
router.get("/current", authenticate, async (req: AuthRequest, res) => {
  try {
    const sub = await db.query.subscriptionsTable.findFirst({
      where: eq(subscriptionsTable.userId, req.user!.userId),
    });

    if (!sub) {
      return res.status(404).json({ error: "No active subscription" });
    }

    const plan = PLANS.find((p) => p.id === sub.planId) || PLANS[0];
    return res.json({
      id: sub.id,
      planId: sub.planId,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? new Date().toISOString(),
      currentPeriodStart: sub.currentPeriodStart?.toISOString() ?? new Date().toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      plan,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /subscriptions/checkout
router.post("/checkout", authenticate, async (req: AuthRequest, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: "planId required" });
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    // In production: create Stripe checkout session
    // For now return a mock URL
    const successUrl = req.body.successUrl || `${req.headers.origin}/subscription?success=true`;
    const cancelUrl = req.body.cancelUrl || `${req.headers.origin}/subscription?cancelled=true`;

    return res.json({
      url: successUrl, // Would be Stripe checkout URL
      sessionId: `cs_mock_${Date.now()}`,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /subscriptions/cancel
router.post("/cancel", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.update(subscriptionsTable).set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
      .where(eq(subscriptionsTable.userId, req.user!.userId));
    return res.json({ message: "Subscription will be cancelled at period end" });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /subscriptions/rewards
router.get("/rewards", authenticate, async (req: AuthRequest, res) => {
  try {
    let reward = await db.query.rewardsTable.findFirst({ where: eq(rewardsTable.userId, req.user!.userId) });
    if (!reward) {
      const [newReward] = await db.insert(rewardsTable).values({ userId: req.user!.userId }).returning();
      reward = newReward;
    }

    const transactions = await db.select().from(rewardTransactionsTable)
      .where(eq(rewardTransactionsTable.userId, req.user!.userId))
      .orderBy(desc(rewardTransactionsTable.createdAt)).limit(10);

    return res.json({
      coins: reward.coins,
      totalEarned: reward.totalEarned,
      tier: reward.tier,
      recentTransactions: transactions.map((t) => ({
        id: t.id, type: t.type, amount: t.amount, description: t.description,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
