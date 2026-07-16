import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, journeyQuestionsTable } from '@workspace/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parsedQuestionsPath = path.resolve(__dirname, 'parsed_questions.json');
const rawData = fs.readFileSync(parsedQuestionsPath, 'utf-8');
const questions = JSON.parse(rawData);



async function seed() {
  console.log('Seeding new journey questions...');
  
  try {
    // Delete existing questions
    await db.delete(journeyQuestionsTable);
    console.log('Cleared existing questions.');

    // Insert new questions
    await db.insert(journeyQuestionsTable).values(questions);
    console.log(`Inserted ${questions.length} new questions successfully!`);
  } catch (err) {
    console.error('Error seeding questions:', err);
  } finally {
    // await pool.end();
  }
}

seed();
