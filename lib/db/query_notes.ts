import { db, instagramNotesTable } from './src/index.ts';

async function run() {
  try {
    const notes = await db.select().from(instagramNotesTable);
    console.log('Total notes:', notes.length);
    console.dir(notes, { depth: null });
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
