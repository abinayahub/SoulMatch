import { Router } from "express";
import { db, supportMessages } from "@workspace/db";
import { z } from "zod";
import { eq } from "drizzle-orm";

const router = Router();

const supportInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

router.post("/", async (req, res) => {
  try {
    const data = supportInputSchema.parse(req.body);
    
    // Attempt to attach user if logged in
    let userId = null;
      if ((req as any).user) {
      userId = (req as any).user.id;
    }

    const [message] = await db.insert(supportMessages).values({
      ...data,
      userId,
    }).returning();

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.log.error({ zodErrors: error.errors }, "Zod validation error");
      res.status(400).json({ message: "Invalid input", errors: error.errors });
      return;
    }
    req.log.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
