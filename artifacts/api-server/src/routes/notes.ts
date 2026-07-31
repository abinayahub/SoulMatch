import { Router } from "express";
import { db, instagramNotesTable, usersTable, photosTable, conversationsTable, messagesTable } from "@workspace/db";
import { eq, or, and, gt, desc, inArray } from "drizzle-orm";
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
      orderBy: [desc(instagramNotesTable.createdAt)]
    });

    // Filter notes to only those from connected users
    const filteredNotes = activeNotes.filter((note: any) => connectedUserIds.has(note.userId));

    // Fetch user and photo details for all filtered note owners
    const userIdsArray = Array.from(new Set(filteredNotes.map((n: any) => Number(n.userId)))).filter(Boolean);
    const usersMap = new Map<any, any>();

    if (userIdsArray.length > 0) {
      const usersList = await db.select().from(usersTable).where(inArray(usersTable.id, userIdsArray));
      const photosList = await db.select().from(photosTable).where(inArray(photosTable.userId, userIdsArray));

      for (const u of usersList) {
        const uPhotos = photosList.filter((p: any) => Number(p.userId) === Number(u.id));
        const primaryPhoto = uPhotos.find((p: any) => p.isPrimary) || uPhotos[0];
        const profilePhoto = primaryPhoto?.url || (u as any).profilePhoto || (u as any).profileImage || null;
        
        let displayName = "";
        const fn = u.firstName && u.firstName.trim() !== "" ? u.firstName.trim() : null;
        const ln = u.lastName && u.lastName.trim() !== "" ? u.lastName.trim() : null;
        const un = u.username && u.username.trim() !== "" ? u.username.trim() : null;
        const em = u.email && u.email.trim() !== "" ? u.email.trim().split("@")[0] : null;
        const dn = u.displayName && u.displayName.trim() !== "" ? u.displayName.trim() : null;

        if (fn && fn !== "User" && fn !== "Unknown User") {
          displayName = fn;
        } else if (dn && dn !== "User" && dn !== "Unknown User") {
          displayName = dn;
        } else if (un && un !== "User") {
          displayName = un;
        } else if (em) {
          displayName = em;
        } else {
          displayName = fn || ln || "User";
        }

        const userObj = {
          id: u.id,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          username: u.username || (u.email ? u.email.split("@")[0] : ""),
          email: u.email || "",
          displayName: displayName,
          profilePhoto: profilePhoto,
          profileImage: profilePhoto,
          photos: uPhotos
        };

        usersMap.set(Number(u.id), userObj);
        usersMap.set(String(u.id), userObj);
      }
    }

    const responseNotes = filteredNotes.map((note: any) => {
      const u = usersMap.get(Number(note.userId)) || usersMap.get(String(note.userId));

      if (!u) {
        console.error(`[Notes API Error] User record missing in DB for note ID ${note.id}, userId: ${note.userId}`);
      }

      const fallbackUser = {
        id: note.userId,
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        displayName: "User",
        profilePhoto: null,
        profileImage: null,
        photos: []
      };

      const finalUser = u || fallbackUser;

      return {
        id: note.id,
        userId: note.userId,
        note: note.content,
        content: note.content,
        createdAt: note.createdAt,
        expiresAt: note.expiresAt,
        isActive: note.isActive,
        displayName: finalUser.displayName,
        profilePhoto: finalUser.profilePhoto,
        profileImage: finalUser.profileImage,
        user: finalUser
      };
    });

    res.json(responseNotes);
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

    // Fetch user details for response
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const uPhotos = await db.select().from(photosTable).where(eq(photosTable.userId, userId));
    const primaryPhoto = uPhotos.find((p: any) => p.isPrimary) || uPhotos[0];
    const profilePhoto = primaryPhoto?.url || (u as any)?.profilePhoto || null;

    let displayName = "";
    if (u?.firstName && u.firstName.trim()) {
      displayName = u.firstName.trim();
    } else if (u?.username && u.username.trim()) {
      displayName = u.username.trim();
    } else if (u?.email && u.email.trim()) {
      displayName = u.email.trim().split("@")[0];
    } else {
      displayName = "Unknown User";
    }

    const userData = u ? {
      id: u.id,
      firstName: u.firstName || null,
      lastName: u.lastName || null,
      username: u.username || null,
      email: u.email || null,
      displayName,
      profilePhoto,
      photos: uPhotos
    } : null;

    res.json({
      id: newNote.id,
      userId: newNote.userId,
      note: newNote.content,
      content: newNote.content,
      createdAt: newNote.createdAt,
      expiresAt: newNote.expiresAt,
      isActive: newNote.isActive,
      firstName: userData?.firstName || null,
      lastName: userData?.lastName || null,
      displayName: userData?.displayName || "Unknown User",
      profilePhoto: userData?.profilePhoto || null,
      user: userData
    });
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
