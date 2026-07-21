import { db, journeyQuestionsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import questions from './parsed_questions.json';

export async function seedJourneyQuestions(force = false) {
  try {
    const existing = await db.select().from(journeyQuestionsTable).limit(1);
    if (existing.length > 0 && !force) {
      console.log('[SEED] Journey questions already exist. Skipping seed.');
      return;
    }

    console.log('[SEED] Seeding journey questions in bulk...');
    await db.insert(journeyQuestionsTable).values(questions as any).onConflictDoNothing();
    console.log(`[SEED] Bulk seeded ${questions.length} questions successfully!`);
  } catch (err) {
    console.error('[SEED] Warning: Non-fatal error during journey questions seed:', err);
  }
}

// Support running directly as script
const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed_journey.ts') || process.argv[1]?.endsWith('seed_journey.mjs');
if (isMain) {
  seedJourneyQuestions(true).then(() => process.exit(0)).catch(() => process.exit(1));
}
