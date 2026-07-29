import { db, instagramNotesTable } from './src/index.ts';
import { eq, and } from 'drizzle-orm';

async function test() {
  try {
    const userId = 1;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    console.log('INSERTING...');
    const [newNote] = await db.insert(instagramNotesTable)
      .values({
        userId,
        content: 'test content',
        createdAt: now,
        expiresAt,
        isActive: true,
      })
      .returning();
    console.log('SUCCESS:', newNote);
  } catch(e) {
    console.error('ERROR CAUSE:', e.cause);
    console.error('ERROR MESSAGE:', e.message);
  }
}
test();
