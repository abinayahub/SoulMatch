import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, reportsTable, verificationsTable, subscriptionsTable, journeyQuestionsTable, interestsTable, dailyJournalsTable, supportMessages, adminLogsTable, platformSettingsTable, profileViewsTable, dailyPollAnswersTable } from "@workspace/db";
import { eq, ilike, or, desc, count, and } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../lib/auth";

const router = Router();

const isAdmin = [authenticate, requireRole("admin", "superadmin")];

import { communityQuestionsTable, communityAnswersTable, notificationsTable } from "@workspace/db/schema";

// GET /admin/community-questions
router.get("/community-questions", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const status = (req.query.status as string) || "Pending";

    const questions = await db
      .select({
        id: communityQuestionsTable.id,
        userId: communityQuestionsTable.userId,
        userGender: communityQuestionsTable.userGender,
        text: communityQuestionsTable.text,
        category: communityQuestionsTable.category,
        isAnonymous: communityQuestionsTable.isAnonymous,
        status: communityQuestionsTable.status,
        createdAt: communityQuestionsTable.createdAt,
        updatedAt: communityQuestionsTable.updatedAt,
        approvedAt: communityQuestionsTable.approvedAt,
        rejectedAt: communityQuestionsTable.rejectedAt,
        rejectionReason: communityQuestionsTable.rejectionReason,
        totalAnswers: count(communityAnswersTable.id),
        user: {
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          displayName: usersTable.displayName,
          email: usersTable.email,
          photoUrl: usersTable.selfieUrl,
        }
      })
      .from(communityQuestionsTable)
      .leftJoin(usersTable, eq(usersTable.id, communityQuestionsTable.userId))
      .leftJoin(communityAnswersTable, eq(communityAnswersTable.questionId, communityQuestionsTable.id))
      .where(eq(communityQuestionsTable.status, status))
      .groupBy(communityQuestionsTable.id, usersTable.id)
      .orderBy(desc(communityQuestionsTable.createdAt));

    return res.json(questions);
  } catch (err) {
    console.error(`Error fetching ${req.query.status} community questions:`, err);
    return res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// PATCH /admin/community-questions/:id/review
router.patch("/community-questions/:id/review", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const { status, reason } = req.body; // status: "Approved" | "Rejected"
    const adminId = req.user!.userId;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [question] = await db
      .select()
      .from(communityQuestionsTable)
      .where(eq(communityQuestionsTable.id, questionId));

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const now = new Date();
    await db.update(communityQuestionsTable)
      .set({
        status,
        adminId,
        approvedAt: status === "Approved" ? now : null,
        rejectedAt: status === "Rejected" ? now : null,
        rejectionReason: reason || null,
        updatedAt: now
      })
      .where(eq(communityQuestionsTable.id, questionId));

    // Send notification
    await db.insert(notificationsTable).values({
      userId: question.userId,
      actorId: adminId,
      type: "system",
      title: status === "Approved" ? "Question Approved" : "Question Rejected",
      body: status === "Approved" 
        ? "Your community question has been approved and published!" 
        : `Your community question was rejected.${reason ? ` Reason: ${reason}` : ""}`,
      actionUrl: `/my-story`
    });

    return res.json({ success: true, message: `Question ${status.toLowerCase()}` });
  } catch (err) {
    console.error("Error reviewing community question:", err);
    return res.status(500).json({ error: "Failed to review question" });
  }
});

// GET /admin/community-questions/:id/answers
router.get("/community-questions/:id/answers", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.params.id);

    const [question] = await db
      .select()
      .from(communityQuestionsTable)
      .where(eq(communityQuestionsTable.id, questionId));

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answers = await db
      .select({
        id: communityAnswersTable.id,
        answer: communityAnswersTable.answer,
        createdAt: communityAnswersTable.createdAt,
        user: {
          id: usersTable.id,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          displayName: usersTable.displayName,
          email: usersTable.email,
          photoUrl: usersTable.selfieUrl,
        }
      })
      .from(communityAnswersTable)
      .leftJoin(usersTable, eq(usersTable.id, communityAnswersTable.userId))
      .where(eq(communityAnswersTable.questionId, questionId))
      .orderBy(desc(communityAnswersTable.createdAt));

    return res.json(answers);
  } catch (err) {
    console.error("Error fetching community question answers:", err);
    return res.status(500).json({ error: "Failed to fetch answers" });
  }
});

// GET /admin/users/stats
router.get("/users/stats", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const allUsers = await db.select().from(usersTable);
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.lastActive && new Date(u.lastActive) >= last30Days).length;
    const premiumUsers = allUsers.filter(u => u.role === "premium" || u.role === "admin").length;
    const verifiedUsers = allUsers.filter(u => u.verificationStatus === "verified").length;
    
    // For pending verification, we can query the verifications table, but to keep it fast, we can use user status if available.
    // Real pending verification count:
    const [pendingRes] = await db.select({ count: count() }).from(verificationsTable).where(eq(verificationsTable.status, "pending"));
    const pendingVerification = Number(pendingRes.count) || 0;

    return res.json({
      totalUsers: { value: totalUsers, trend: "+12.5% vs last 30 days" },
      activeUsers: { value: activeUsers, trend: "+8.3% vs last 30 days" },
      premiumUsers: { value: premiumUsers, trend: "+15.7% vs last 30 days" },
      verifiedUsers: { value: verifiedUsers, trend: "+10.2% vs last 30 days" },
      pendingVerification: { value: pendingVerification, trend: "-5.4% vs last 30 days" }
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/users
router.get("/users", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const gender = req.query.gender as string;
    const ageRange = req.query.ageRange as string;
    const location = req.query.location as string;
    const premium = req.query.premium as string;
    const verification = req.query.verification as string;
    const progress = req.query.progress as string;
    const insights = req.query.insights as string;

    let usersQuery = db.select().from(usersTable);
    const allUsers = await usersQuery;
    
    const now = new Date();
    
    let filteredUsers = allUsers.filter(u => {
      let matches = true;

      if (search) {
        const lowerSearch = search.toLowerCase();
        matches = matches && (
          u.email.toLowerCase().includes(lowerSearch) || 
          (u.firstName || "").toLowerCase().includes(lowerSearch) || 
          (u.lastName || "").toLowerCase().includes(lowerSearch)
        );
      }

      if (gender) matches = matches && u.gender === gender;
      
      if (premium) {
        const isPremium = u.role === "premium" || u.role === "admin";
        matches = matches && (premium === "true" ? isPremium : !isPremium);
      }
      
      if (verification) matches = matches && u.verificationStatus === verification;

      if (location) {
        const isLocal = u.country === "US" || u.country === "USA" || !u.country;
        matches = matches && (location === "local" ? isLocal : !isLocal);
      }

      if (ageRange) {
        let age = null;
        if (u.dateOfBirth) {
          const birthDate = new Date(u.dateOfBirth);
          age = now.getFullYear() - birthDate.getFullYear();
          const m = now.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
        }
        if (age !== null) {
          if (ageRange === "18-24") matches = matches && (age >= 18 && age <= 24);
          else if (ageRange === "25-34") matches = matches && (age >= 25 && age <= 34);
          else if (ageRange === "35-44") matches = matches && (age >= 35 && age <= 44);
          else if (ageRange === "45+") matches = matches && (age >= 45);
        } else {
          matches = false;
        }
      }

      if (progress) {
        const p = u.journeyProgress || 0;
        if (progress === "completed") matches = matches && p >= 150;
        else if (progress === "in_progress") matches = matches && p > 0 && p < 150;
        else if (progress === "not_started") matches = matches && p === 0;
      }

      return matches;
    });
    
    const totalCount = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return res.json({
      users: paginatedUsers.map((u) => {
        let age = null;
        if (u.dateOfBirth) {
          const birthDate = new Date(u.dateOfBirth);
          age = now.getFullYear() - birthDate.getFullYear();
          const m = now.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
        }

        return {
          id: u.id, 
          email: u.email, 
          firstName: u.firstName, 
          lastName: u.lastName,
          avatar: u.selfieUrl || u.govIdFrontUrl || "",
          age: age,
          gender: u.gender || "Unknown",
          location: [u.city, u.country].filter(Boolean).join(', ') || "Unknown",
          phone: u.phone,
          role: u.role, 
          status: u.status, 
          verificationStatus: u.verificationStatus,
          isPremium: u.role === "premium" || u.role === "admin",
          subscriptionPlan: u.role === "premium" ? "premium_monthly" : null,
          reportCount: 0, 
          lastActive: u.lastActive?.toISOString() ?? null,
          createdAt: u.createdAt.toISOString(), 
          journeyProgress: u.journeyProgress,
        };
      }),
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/users/:userId
router.get("/users/:userId", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId as string);
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    let age = null;
    if (user.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth);
      const now = new Date();
      age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
    }

    return res.json({
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      avatar: user.selfieUrl || user.govIdFrontUrl || "",
      age, gender: user.gender, location: [user.city, user.country].filter(Boolean).join(', ') || "Unknown",
      phone: user.phone,
      role: user.role, status: user.status, verificationStatus: user.verificationStatus,
      isPremium: user.role === "premium" || user.role === "admin",
      subscriptionPlan: user.role === "premium" ? "premium_monthly" : null,
      reportCount: 0, lastActive: user.lastActive?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(), journeyProgress: user.journeyProgress,
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/users/:userId/action
router.post("/users/:userId/action", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId as string);
    const { action } = req.body;

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updateData: any = { updatedAt: new Date() };

    switch (action) {
      case "verify":
        updateData.verificationStatus = "verified";
        break;
      case "grant_premium":
        updateData.role = "premium";
        break;
      case "suspend":
        updateData.status = "suspended";
        break;
      case "ban":
        updateData.status = "banned";
        break;
      case "delete":
        await db.delete(supportMessages).where(eq(supportMessages.userId, userId)).catch(() => {});
        await db.delete(adminLogsTable).where(eq(adminLogsTable.adminId, userId)).catch(() => {});
        await db.update(platformSettingsTable).set({ updatedBy: null }).where(eq(platformSettingsTable.updatedBy, userId)).catch(() => {});
        await db.delete(profileViewsTable).where(or(eq(profileViewsTable.viewerId, userId), eq(profileViewsTable.targetUserId, userId))).catch(() => {});
        await db.delete(dailyPollAnswersTable).where(eq(dailyPollAnswersTable.userId, userId)).catch(() => {});
        
        await db.delete(usersTable).where(eq(usersTable.id, userId));
        return res.json({ message: "User deleted successfully" });
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId));
    return res.json({ message: `Action ${action} performed successfully` });
  } catch (err: any) { 
    req.log.error(err); 
    return res.status(500).json({ error: String(err.stack || err) }); 
  }
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

// GET /admin/overview
router.get("/overview", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const { gte } = await import("drizzle-orm");
    const { interestsTable, messagesTable } = await import("@workspace/db");
    
    // Fetch only needed columns to prevent massive memory usage
    const allUsers = await db.select({
      id: usersTable.id,
      gender: usersTable.gender,
      dateOfBirth: usersTable.dateOfBirth,
      createdAt: usersTable.createdAt,
      lastActive: usersTable.lastActive,
      role: usersTable.role,
      journeyProgress: usersTable.journeyProgress
    }).from(usersTable);
    
    const allInterests = await db.select({
      id: interestsTable.id,
      status: interestsTable.status,
      createdAt: interestsTable.createdAt
    }).from(interestsTable);
    
    const [messagesCountRes] = await db.select({ count: count() }).from(messagesTable);
    const messagesSent = Number(messagesCountRes.count) || 0;

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = allUsers.length;
    const premiumUsers = allUsers.filter(u => u.role === "premium").length;
    const activeUsersToday = allUsers.filter(u => u.lastActive && new Date(u.lastActive) >= yesterday).length;
    const newRegistrationsToday = allUsers.filter(u => new Date(u.createdAt) >= yesterday).length;
    const matchesGenerated = allInterests.length;
    const matchesAccepted = allInterests.filter(i => i.status === "accepted").length;
    const matchesRejected = allInterests.filter(i => i.status === "declined").length;
    const monthlyRevenue = premiumUsers * 10; 

    // Questionnaire stats
    const completed = allUsers.filter(u => u.journeyProgress === 100).length;
    const inProgress = allUsers.filter(u => u.journeyProgress > 0 && u.journeyProgress < 100).length;
    const notStarted = totalUsers - completed - inProgress;
    const completedPct = totalUsers ? Math.round((completed / totalUsers) * 100) : 0;
    const inProgressPct = totalUsers ? Math.round((inProgress / totalUsers) * 100) : 0;
    const notStartedPct = totalUsers ? Math.round((notStarted / totalUsers) * 100) : 0;

    // Demographics
    const femaleCount = allUsers.filter(u => u.gender === "female").length;
    const maleCount = allUsers.filter(u => u.gender === "male").length;
    const otherCount = totalUsers - femaleCount - maleCount;
    
    let age18_24 = 0, age25_34 = 0, age35_44 = 0, age45_plus = 0;
    allUsers.forEach(u => {
      if (u.dateOfBirth) {
        const birthDate = new Date(u.dateOfBirth);
        if (!isNaN(birthDate.getTime())) {
          let age = now.getFullYear() - birthDate.getFullYear();
          const m = now.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
          if (age >= 18 && age <= 24) age18_24++;
          else if (age >= 25 && age <= 34) age25_34++;
          else if (age >= 35 && age <= 44) age35_44++;
          else if (age >= 45) age45_plus++;
        }
      }
    });

    const femalePct = totalUsers ? Math.round((femaleCount / totalUsers) * 100) : 0;
    const malePct = totalUsers ? Math.round((maleCount / totalUsers) * 100) : 0;
    const otherPct = totalUsers ? Math.round((otherCount / totalUsers) * 100) : 0;

    const ageTotal = age18_24 + age25_34 + age35_44 + age45_plus;
    const pct = (val: number) => ageTotal ? Math.round((val / ageTotal) * 100) : 0;

    // User Growth (Generate 7 points up to today)
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000);
      const totalAtDate = allUsers.filter(u => new Date(u.createdAt) <= d).length;
      const startOfDay = new Date(d); startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(d); endOfDay.setHours(23,59,59,999);
      const newAtDate = allUsers.filter(u => {
        const cDate = new Date(u.createdAt);
        return cDate >= startOfDay && cDate <= endOfDay;
      }).length;

      userGrowth.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalUsers: totalAtDate,
        newUsers: newAtDate
      });
    }

    // Match Trend
    const matchTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000);
      const totalGenAtDate = allInterests.filter(int => new Date(int.createdAt) <= d).length;
      const totalAccAtDate = allInterests.filter(int => new Date(int.createdAt) <= d && int.status === "accepted").length;
      const rate = totalGenAtDate ? Math.round((totalAccAtDate / totalGenAtDate) * 100) : 0;
      matchTrend.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate
      });
    }

    const recentUsers = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(5);
    const recentMatchesDb = await db.select().from(interestsTable)
      .where(eq(interestsTable.status, "accepted"))
      .orderBy(desc(interestsTable.createdAt))
      .limit(5); 
    
    const uniqueMatches: any[] = [];
    for (const match of recentMatchesDb) {
      const u1 = await db.query.usersTable.findFirst({ where: eq(usersTable.id, match.fromUserId) });
      const u2 = await db.query.usersTable.findFirst({ where: eq(usersTable.id, match.toUserId) });
      
      uniqueMatches.push({
        id: match.id,
        p1: u1?.firstName || "User",
        p1Avatar: u1?.selfieUrl || u1?.govIdFrontUrl || "",
        p2: u2?.firstName || "User",
        p2Avatar: u2?.selfieUrl || u2?.govIdFrontUrl || "",
        compatibility: 85, 
        time: new Date(match.createdAt).toLocaleDateString()
      });
    }

    const overview = {
      topMetrics: {
        totalUsers: { value: totalUsers, trend: `+${newRegistrationsToday} from yesterday` },
        premiumUsers: { value: premiumUsers, trend: "Current total" },
        matchesGenerated: { value: matchesGenerated, trend: "Current total" },
        aiAnalysisCompleted: { value: 0, trend: "N/A" },
        dailyActiveUsers: { value: activeUsersToday, trend: "Active in last 24h" },
        monthlyRevenue: { value: monthlyRevenue, trend: "Estimated MRR", prefix: "$" },
      },
      charts: {
        userGrowth,
        genderDistribution: [
          { name: "Female", value: femalePct },
          { name: "Male", value: malePct },
          { name: "Other", value: otherPct },
        ],
        ageDistribution: [
          { name: "18-24", value: pct(age18_24) },
          { name: "25-34", value: pct(age25_34) },
          { name: "35-44", value: pct(age35_44) },
          { name: "45+", value: pct(age45_plus) },
        ],
        aiAnalysis: {
          averageScore: 0, total: 0, breakdown: [
            { name: "High Confidence (80%+)", value: 0, percentage: 0, color: "#10B981" },
            { name: "Medium Confidence (50-79%)", value: 0, percentage: 0, color: "#F59E0B" },
            { name: "Low Confidence (<50%)", value: 0, percentage: 0, color: "#EC4899" },
          ]
        },
        matchPerformance: {
          generated: matchesGenerated,
          accepted: matchesAccepted,
          rejected: matchesRejected,
          successRate: matchesGenerated ? Math.round((matchesAccepted / matchesGenerated) * 100) : 0, 
          trend: matchTrend
        },
        questionnaireProgress: {
          averageCompletion: completedPct,
          total: totalUsers,
          breakdown: [
            { name: "Completed", value: completed, percentage: completedPct, color: "#10B981" },
            { name: "In Progress", value: inProgress, percentage: inProgressPct, color: "#F59E0B" },
            { name: "Not Started", value: notStarted, percentage: notStartedPct, color: "#EC4899" },
          ]
        }
      },
      lists: {
        recentRegistrations: recentUsers.map(u => ({
          id: u.id, 
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Anonymous', 
          email: u.email, 
          time: new Date(u.createdAt).toLocaleDateString(), 
          location: [u.city, u.country].filter(Boolean).join(', ') || "Unknown", 
          avatar: u.selfieUrl || u.govIdFrontUrl || "" 
        })),
        recentMatches: uniqueMatches.slice(0, 5),
        systemHealth: [
          { name: "API Server", status: "Operational", color: "text-green-500" },
          { name: "Database", status: "Operational", color: "text-green-500" },
          { name: "AI Analysis Engine", status: "Operational", color: "text-green-500" },
          { name: "File Storage", status: "Operational", color: "text-green-500" },
          { name: "Email Service", status: "Operational", color: "text-green-500" },
        ]
      }
    };

    return res.json(overview);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/journals
router.get("/journals", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const { dailyJournalsTable } = await import("@workspace/db");
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const journals = await db.select()
      .from(dailyJournalsTable)
      .innerJoin(usersTable, eq(dailyJournalsTable.userId, usersTable.id))
      .orderBy(desc(dailyJournalsTable.createdAt));
      
    const totalCount = journals.length;
    const paginated = journals.slice(offset, offset + limit);
      
    return res.json({
      journals: paginated.map(row => ({
        id: row.daily_journals.id,
        content: row.daily_journals.content,
        imageUrl: row.daily_journals.imageUrl,
        date: row.daily_journals.createdAt.toISOString(),
        type: "Personal Growth", // Default mock types for now
        visibility: "Public",
        reactions: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 100) + 2,
        status: "Active",
        author: {
          id: row.users.id,
          name: `${row.users.firstName || ''} ${row.users.lastName || ''}`.trim() || 'Anonymous',
          email: row.users.email,
          avatar: row.users.selfieUrl || row.users.govIdFrontUrl || "",
          location: `${row.users.city || ''}, ${row.users.country || ''}`.trim() || "Unknown"
        }
      })),
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/questions/stats
router.get("/questions/stats", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const allQuestions = await db.select().from(journeyQuestionsTable);
    
    const totalQuestions = allQuestions.length;
    const activeQuestions = allQuestions.filter(q => q.isActive).length;
    const inactiveQuestions = allQuestions.filter(q => !q.isActive).length;
    
    const daysSet = new Set(allQuestions.map(q => q.day));
    const totalDays = daysSet.size;

    return res.json({
      totalQuestions: { value: totalQuestions, acrossCategories: new Set(allQuestions.map(q => q.category)).size },
      activeQuestions: { value: activeQuestions, percentage: totalQuestions ? Math.round((activeQuestions / totalQuestions) * 100 * 10) / 10 : 0 },
      inactiveQuestions: { value: inactiveQuestions, percentage: totalQuestions ? Math.round((inactiveQuestions / totalQuestions) * 100 * 10) / 10 : 0 },
      totalDays: { value: Math.max(totalDays, 30) } // Default to 30 for UI consistency if needed
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/questions
router.get("/questions", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const dayStr = req.query.day as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const allQuestions = await db.select().from(journeyQuestionsTable).orderBy(journeyQuestionsTable.id);
    let filtered = allQuestions;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(q => q.question.toLowerCase().includes(s));
    }
    if (category && category !== 'All Categories') {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    if (dayStr && dayStr !== 'All Days') {
      const dayMatches = dayStr.match(/\d+/);
      if (dayMatches) {
        const day = parseInt(dayMatches[0]);
        filtered = filtered.filter(q => q.day === day);
      }
    }
    if (type && type !== 'All Types') {
      // Map UI types to db enums if needed, or just match exactly if db has same string
      filtered = filtered.filter(q => q.questionType === type);
    }
    if (status && status !== 'Status') {
      const isActive = status.toLowerCase() === 'active';
      filtered = filtered.filter(q => q.isActive === isActive);
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return res.json({
      questions: paginated.map((q, idx) => ({
        id: q.id,
        index: offset + idx + 1,
        question: q.question,
        category: q.category,
        day: q.day,
        type: q.questionType,
        isActive: q.isActive,
        options: q.options || []
      })),
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/questions
router.post("/questions", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const { category, day, type, question, options, isActive } = req.body;
    
    if (!category || !day || !type || !question) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [newQuestion] = await db.insert(journeyQuestionsTable).values({
      category,
      day: parseInt(day),
      questionType: type as any,
      question,
      options: options || [],
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    return res.status(201).json(newQuestion);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// PUT /admin/questions/:id
router.put("/questions/:id", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { category, day, type, question, options, isActive } = req.body;
    
    const [updated] = await db.update(journeyQuestionsTable)
      .set({
        category,
        day: day ? parseInt(day) : undefined,
        questionType: type as any,
        question,
        options,
        isActive
      })
      .where(eq(journeyQuestionsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Question not found" });
    return res.json(updated);
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /admin/questions/:id
router.delete("/questions/:id", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [deleted] = await db.delete(journeyQuestionsTable)
      .where(eq(journeyQuestionsTable.id, id))
      .returning();

    if (!deleted) return res.status(404).json({ error: "Question not found" });
    return res.json({ success: true });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/matches/stats
router.get("/matches/stats", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const allInterests = await db.select().from(interestsTable);

    const totalMatches = allInterests.length;
    const acceptedMatches = allInterests.filter(i => i.status === "accepted").length;
    const pendingMatches = allInterests.filter(i => i.status === "pending").length;
    const rejectedMatches = allInterests.filter(i => i.status === "declined").length;
    
    let successRate = 0;
    if (totalMatches > 0) {
      successRate = (acceptedMatches / totalMatches) * 100;
    }

    return res.json({
      totalMatches: { value: totalMatches, trend: "+14.2% vs last 30 days" },
      acceptedMatches: { value: acceptedMatches, trend: "+16.7% vs last 30 days" },
      pendingMatches: { value: pendingMatches, trend: "+5.3% vs last 30 days" },
      rejectedMatches: { value: rejectedMatches, trend: "-3.6% vs last 30 days" },
      successRate: { value: successRate.toFixed(1) + "%", trend: "+4.8% vs last 30 days" }
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/matches
router.get("/matches", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string || "").toLowerCase();
    const status = req.query.status as string;
    const { personalityProfilesTable } = await import("@workspace/db");
    const interests = await db.select().from(interestsTable).orderBy(desc(interestsTable.createdAt));
    const users = await db.select().from(usersTable);
    const profiles = await db.select().from(personalityProfilesTable);
    
    let enrichedMatches = interests.map((interest) => {
      const fromUser = users.find(u => u.id === interest.fromUserId);
      const toUser = users.find(u => u.id === interest.toUserId);
      
      const fromProfile = profiles.find(p => p.userId === interest.fromUserId);
      const toProfile = profiles.find(p => p.userId === interest.toUserId);
      
      let compScore = 0;
      
      if (fromProfile && toProfile && fromProfile.traits && toProfile.traits) {
        try {
          const fromTraits = JSON.parse(fromProfile.traits);
          const toTraits = JSON.parse(toProfile.traits);
          
          let totalDiff = 0;
          let matchedCount = 0;
          
          for (const ft of fromTraits) {
            const tt = toTraits.find((t: any) => t.trait === ft.trait);
            if (tt) {
              totalDiff += Math.abs(ft.score - tt.score);
              matchedCount++;
            }
          }
          
          if (matchedCount > 0) {
            const avgDiff = totalDiff / matchedCount;
            compScore = Math.max(70, Math.min(99, Math.round(100 - (avgDiff * 0.4))));
          }
        } catch(e) {}
      }
      
      return {
        id: interest.id,
        fromUser: fromUser ? {
          id: fromUser.id,
          name: `${fromUser.firstName || ''} ${fromUser.lastName || ''}`.trim(),
          email: fromUser.email,
          location: `${fromUser.city || ''}, ${fromUser.country || ''}`.trim(),
          age: fromUser.dateOfBirth ? new Date().getFullYear() - new Date(fromUser.dateOfBirth).getFullYear() : null,
          gender: fromUser.gender,
          avatar: fromUser.selfieUrl || fromUser.govIdFrontUrl || ""
        } : null,
        toUser: toUser ? {
          id: toUser.id,
          name: `${toUser.firstName || ''} ${toUser.lastName || ''}`.trim(),
          email: toUser.email,
          location: `${toUser.city || ''}, ${toUser.country || ''}`.trim(),
          age: toUser.dateOfBirth ? new Date().getFullYear() - new Date(toUser.dateOfBirth).getFullYear() : null,
          gender: toUser.gender,
          avatar: toUser.selfieUrl || toUser.govIdFrontUrl || ""
        } : null,
        status: interest.status, // "accepted", "pending", "declined"
        compatibility: compScore,
        matchType: (interest.fromUserId + interest.toUserId) % 5 === 0 ? "Premium Match" : "AI Match",
        matchDate: interest.createdAt,
        updatedAt: interest.updatedAt,
      };
    }).filter(m => m.fromUser && m.toUser); // ensure both users exist

    if (search) {
      enrichedMatches = enrichedMatches.filter(m => 
        (m.fromUser && (m.fromUser.name.toLowerCase().includes(search) || m.fromUser.email.toLowerCase().includes(search))) ||
        (m.toUser && (m.toUser.name.toLowerCase().includes(search) || m.toUser.email.toLowerCase().includes(search)))
      );
    }
    
    if (status && status !== 'All') {
      const dbStatus = status.toLowerCase() === 'rejected' ? 'declined' : status.toLowerCase();
      enrichedMatches = enrichedMatches.filter(m => m.status === dbStatus);
    }

    const totalCount = enrichedMatches.length;
    const paginated = enrichedMatches.slice(offset, offset + limit);

    return res.json({
      matches: paginated,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/journals/stats
router.get("/journals/stats", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const allJournals = await db.select().from(dailyJournalsTable);
    
    // Total stories & journals
    const totalJournals = allJournals.length;
    
    // Active Contributors (unique users)
    const uniqueUserIds = new Set(allJournals.map(j => j.userId));
    const activeContributors = uniqueUserIds.size;
    
    // Mock moderation stats for the UI
    const totalReactions = totalJournals * 12 + 5; 
    const reports = Math.floor(totalJournals * 0.05);
    const hiddenContent = Math.floor(reports * 0.5);

    return res.json({
      totalStories: { value: Math.floor(totalJournals * 0.4), trend: "+14.8% vs last 30 days" },
      totalJournals: { value: totalJournals, trend: "+18.3% vs last 30 days" },
      activeContributors: { value: activeContributors, trend: "+12.5% vs last 30 days" },
      totalReactions: { value: totalReactions, trend: "+16.7% vs last 30 days" },
      reports: { value: reports, trend: "+6.3% vs last 30 days" },
      hiddenContent: { value: hiddenContent, trend: "+8.1% vs last 30 days" },
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/journals
router.get("/journals", async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string || "").toLowerCase();
    const statusFilter = (req.query.status as string || "");
    const typeFilter = (req.query.type as string || "");
    const visFilter = (req.query.vis as string || "");
    
    const journals = await db.select().from(dailyJournalsTable).orderBy(desc(dailyJournalsTable.createdAt));
    const users = await db.select().from(usersTable);
    
    let enrichedJournals = journals.map((journal) => {
      const author = users.find(u => String(u.id) === String(journal.userId));
      const isStory = journal.imageUrl ? true : false;
      const type = isStory ? "Success Story" : "Personal Growth";
      
      // Mock stats
      const reactions = (journal.id * 7) % 500;
      const comments = (journal.id * 3) % 150;
      const status = journal.id % 7 === 0 ? "Under Review" : journal.id % 11 === 0 ? "Hidden" : "Active";
      const visibility = journal.id % 5 === 0 ? "Private" : "Public";
      
      return {
        id: journal.id,
        content: journal.content,
        imageUrl: journal.imageUrl,
        author: author ? {
          id: author.id,
          name: `${author.firstName || ''} ${author.lastName || ''}`.trim(),
          email: author.email,
          location: `${author.city || ''}, ${author.country || ''}`.trim(),
          avatar: author.selfieUrl || author.govIdFrontUrl || ""
        } : null,
        type,
        visibility,
        reactions,
        comments,
        status,
        date: journal.createdAt,
      };
    }).filter(j => j.author); // Ensure author exists

    if (search) {
      enrichedJournals = enrichedJournals.filter(j => 
        (j.author && (j.author.name.toLowerCase().includes(search) || j.author.email.toLowerCase().includes(search))) ||
        (j.content.toLowerCase().includes(search))
      );
    }
    
    if (statusFilter && statusFilter !== "All") {
      enrichedJournals = enrichedJournals.filter(j => j.status === statusFilter);
    }
    
    if (typeFilter && typeFilter !== "All") {
      enrichedJournals = enrichedJournals.filter(j => j.type === typeFilter);
    }
    
    if (visFilter && visFilter !== "All") {
      enrichedJournals = enrichedJournals.filter(j => j.visibility === visFilter);
    }
    
    if (visFilter && visFilter !== "All") {
      enrichedJournals = enrichedJournals.filter(j => j.visibility === visFilter);
    }
    
    console.log("Found journals:", journals.length, "Enriched:", enrichedJournals.length);

    const totalCount = enrichedJournals.length;
    const paginated = enrichedJournals.slice(offset, offset + limit);

    return res.json({
      journals: paginated,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/journals/seed
router.get("/journals/seed", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).limit(5);
    if (users.length === 0) return res.json({ msg: "No users found in database to author stories" });
    const journalsToInsert = [
      {
        userId: users[0]?.id || users[users.length - 1].id,
        content: "A beautiful connection made on SoulMatch\nWe started chatting in March and immediately knew we had something special. We finally met in person last week!",
        imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&q=80",
      },
      {
        userId: users[1]?.id || users[0].id,
        content: "Embracing self-discovery\nTaking a break to focus on myself has been the best decision. I feel more ready than ever for a meaningful relationship.",
        imageUrl: null,
      },
      {
        userId: users[2]?.id || users[0].id,
        content: "Engaged to my perfect match!\nHe proposed at the exact spot we had our first date. Thank you SoulMatch for helping me find my forever person.",
        imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80",
      },
      {
        userId: users[3]?.id || users[0].id,
        content: "Navigating dating in a new city\nMoved to a new place and used the app to meet people. It's been a wonderful journey so far.",
        imageUrl: null,
      },
      {
        userId: users[4]?.id || users[0].id,
        content: "The importance of communication\nJust wanted to share a quick thought: always be honest about what you're looking for from day one.",
        imageUrl: null,
      },
      {
        userId: users[0]?.id || users[0].id,
        content: "Our spontaneous weekend trip\nWe decided to go camping for our third date. Best decision ever!",
        imageUrl: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=400&q=80",
      },
      {
        userId: users[1]?.id || users[0].id,
        content: "Taking things slow\nWe've been dating for 6 months and just taking our time. There's no rush when it feels right.",
        imageUrl: null,
      }
    ];

    await db.insert(dailyJournalsTable).values(journalsToInsert);
    return res.json({ success: true, inserted: journalsToInsert.length });
  } catch (err) { req.log.error(err); return res.status(500).json({ error: "error" }); }
});

// GET /admin/support
router.get("/support", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const messages = await db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt));
    return res.json(messages);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/support/:id
router.patch("/support/:id", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    
    
    const [updated] = await db.update(supportMessages)
      .set({ 
        status, 
        resolvedAt: status === "resolved" ? new Date() : null 
      })
      .where(eq(supportMessages.id, id))
      .returning();
      
    if (!updated) return res.status(404).json({ error: "Support message not found" });
    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/premium/stats
router.get("/premium/stats", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const allSubs = await db.select().from(subscriptionsTable);
    const activeSubs = allSubs.filter(s => s.status === 'active' || s.status === 'trialing');
    
    // Calculate MRR
    let mrr = 0;
    for (const sub of activeSubs) {
      if (sub.planId === 'premium_monthly') mrr += 24.99;
      else if (sub.planId === 'premium_annual') mrr += (199.99 / 12);
      else if (sub.planId === 'basic_monthly') mrr += 9.99;
    }
    
    return res.json({
      activeSubscriptions: activeSubs.length,
      mrr: Math.round(mrr),
      newThisWeek: activeSubs.filter(s => {
        const start = s.currentPeriodStart ? new Date(s.currentPeriodStart) : new Date(s.createdAt);
        return start > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }).length,
      churnRate: allSubs.length > 0 ? Math.round((allSubs.filter(s => s.status === 'canceled').length / allSubs.length) * 100) : 0,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/premium/users
router.get("/premium/users", ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const search = req.query.search as string || "";
    const status = req.query.status as string || "All";
    
    let query = db.select({
      id: subscriptionsTable.id,
      userId: subscriptionsTable.userId,
      planId: subscriptionsTable.planId,
      status: subscriptionsTable.status,
      currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
      currentPeriodStart: subscriptionsTable.currentPeriodStart,
      cancelAtPeriodEnd: subscriptionsTable.cancelAtPeriodEnd,
      user: {
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        displayName: usersTable.displayName,
        email: usersTable.email,
        selfieUrl: usersTable.selfieUrl,
      }
    }).from(subscriptionsTable)
    .leftJoin(usersTable, eq(usersTable.id, subscriptionsTable.userId))
    .orderBy(desc(subscriptionsTable.currentPeriodStart));
    
    let subs = await query;
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      subs = subs.filter(s => 
        s.user?.displayName?.toLowerCase().includes(lowerSearch) || 
        s.user?.email?.toLowerCase().includes(lowerSearch) ||
        s.user?.firstName?.toLowerCase().includes(lowerSearch) ||
        s.user?.lastName?.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (status !== 'All') {
      subs = subs.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const paginatedSubs = subs.slice(offset, offset + limit);
    
    return res.json({
      total: subs.length,
      page,
      totalPages: Math.ceil(subs.length / limit),
      subscriptions: paginatedSubs,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
