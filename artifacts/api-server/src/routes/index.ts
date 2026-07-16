import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import journeyRouter from "./journey";
import matchesRouter from "./matches";
import interestsRouter from "./interests";
import chatRouter from "./chat";
import subscriptionsRouter from "./subscriptions";
import notificationsRouter from "./notifications";
import reportsRouter from "./reports";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";
import journalRouter from "./journal";
import metricsRouter from "./metrics";
import supportRouter from "./support";
import reflectionsRouter from "./reflections";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/journey", journeyRouter);
router.use("/matches", matchesRouter);
router.use("/interests", interestsRouter);
router.use("/chat", chatRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/notifications", notificationsRouter);
router.use("/reports", reportsRouter);
router.use("/admin", adminRouter);
router.use("/analytics", analyticsRouter);
router.use("/journal", journalRouter);
router.use("/metrics", metricsRouter);
router.use("/support", supportRouter);
router.use("/reflections", reflectionsRouter);

export default router;
