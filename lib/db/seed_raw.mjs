import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parsedQuestionsPath = path.resolve(__dirname, '../../artifacts/api-server/src/parsed_questions.json');
const rawData = fs.readFileSync(parsedQuestionsPath, 'utf-8');
const questions = JSON.parse(rawData);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log('Seeding new journey questions using raw pg...');
  
  try {
    await pool.query('DELETE FROM journey_answers');
    await pool.query('DELETE FROM journey_questions');
    console.log('Cleared existing answers and questions.');

    let inserted = 0;
    for (const q of questions) {
      await pool.query(
        'INSERT INTO journey_questions (day, category, question, question_type, options, is_active) VALUES ($1, $2, $3, $4, $5, true)',
        [q.day, q.category, q.question, q.questionType, q.options]
      );
      inserted++;
    }
    
    console.log(`Inserted ${inserted} new questions successfully!`);
  } catch (err) {
    console.error('Error seeding questions:', err);
  } finally {
    await pool.end();
  }
}

seed();
