import { Router } from "express";
import { db, instagramNotesTable, usersTable, conversationsTable, messagesTable } from "@workspace/db";
import { eq, or, and, gt, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../lib/auth";

export const notesRouter = Router();
notesRouter.use(authenticate);

// Get active notes from connected users
notesRouter.get("/", async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user!.userId;

    // A user is connected if they have an active conversation
    const conversations = await db.query.conversationsTable.findMany({
      where: or(
        eq(conversationsTable.user1Id, userId),
        eq(conversationsTable.user2Id, userId)
      ),
    });

    const connectedUserIds = new Set<number>();
    for (const conv of conversations) {
      if (conv.user1Id !== userId) connectedUserIds.add(conv.user1Id!);
      if (conv.user2Id !== userId) connectedUserIds.add(conv.user2Id!);
    }

    // Always include the current user to get their own note
    connectedUserIds.add(userId);

    const now = new Date();

    const activeNotes = await db.query.instagramNotesTable.findMany({
      where: and(
        eq(instagramNotesTable.isActive, true),
        gt(instagramNotesTable.expiresAt, now) // Not expired
      ),
      with: {
        // We'll need to manually join users if we want the photos/names, but let's just fetch the raw notes first
        // Wait, does Drizzle relations allow "with: { user: true }" ?
        // We didn't define relations in the schema file explicitly using relations(), so we should do a manual join or just return notes.
      },
      orderBy: [desc(instagramNotesTable.createdAt)]
    });

    // Filter notes to only those from connected users
    const filteredNotes = activeNotes.filter((note: any) => connectedUserIds.has(note.userId));

    res.json(filteredNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create or update a note
notesRouter.post("/", async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user!.userId;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: "Content is required" });
    }

    const trimmedContent = content.trim().substring(0, 60);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Deactivate old active notes first
    await db.update(instagramNotesTable)
      .set({ isActive: false })
      .where(and(eq(instagramNotesTable.userId, userId), eq(instagramNotesTable.isActive, true)));

    // Create new note
    const [newNote] = await db.insert(instagramNotesTable)
      .values({
        userId,
        content: trimmedContent,
        createdAt: now,
        expiresAt,
        isActive: true,
      })
      .returning();

    res.json(newNote);
  } catch (error) {
    console.error("Notes POST Error:", error);
    res.status(500).json({ error: (error as Error)?.message || "Internal Server Error" });
  }
});

// Delete a note
notesRouter.delete("/", async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user!.userId;

    await db.update(instagramNotesTable)
      .set({ isActive: false })
      .where(and(eq(instagramNotesTable.userId, userId), eq(instagramNotesTable.isActive, true)));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
