import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const res = await pool.query('SELECT id, content, ai_analysis FROM daily_journals ORDER BY id DESC LIMIT 2;');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}
run();
