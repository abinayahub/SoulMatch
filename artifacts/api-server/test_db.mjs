import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function check() {
  const res = await pool.query('SELECT id, content, ai_analysis FROM daily_journals ORDER BY id DESC LIMIT 3');
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}
check();
