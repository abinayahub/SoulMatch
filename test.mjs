import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res1 = await pool.query("SELECT * FROM daily_journals");
  console.log("journals:", res1.rows);
  const res2 = await pool.query("SELECT * FROM daily_reflections");
  console.log("reflections:", res2.rows);
  pool.end();
}
run();
