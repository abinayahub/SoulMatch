import { db, journeyQuestionsTable } from '@workspace/db';
import questions from './parsed_questions.json';

export async function seedJourneyQuestions(force = false) {
  try {
    if (!force) {
      const existing = await db.select().from(journeyQuestionsTable).limit(1);
      if (existing.length > 0) {
        console.log('[SEED] Journey questions already exist. Skipping seed.');
        return;
      }
    }

    console.log('[SEED] Seeding journey questions...');
    
    // Delete existing questions if forcing or if empty
    await db.delete(journeyQuestionsTable);
    console.log('[SEED] Cleared existing questions.');

    // Insert new questions
    await db.insert(journeyQuestionsTable).values(questions as any);
    console.log(`[SEED] Inserted ${questions.length} new questions successfully!`);
  } catch (err) {
    console.error('[SEED] Error seeding questions:', err);
  }
}

// Support running directly as script
const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed_journey.ts') || process.argv[1]?.endsWith('seed_journey.mjs');
if (isMain) {
  seedJourneyQuestions(true).then(() => process.exit(0)).catch(() => process.exit(1));
}
