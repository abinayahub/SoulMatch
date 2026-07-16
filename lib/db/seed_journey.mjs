import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { journeyQuestionsTable } from './src/schema/journey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parsedQuestionsPath = path.resolve(__dirname, '../../artifacts/api-server/src/parsed_questions.json');
const rawData = fs.readFileSync(parsedQuestionsPath, 'utf-8');
const questions = JSON.parse(rawData);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

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
    await pool.end();
  }
}

seed();
