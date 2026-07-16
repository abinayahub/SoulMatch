import 'dotenv/config';
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const result = await pool.query("SELECT * FROM users ORDER BY id DESC LIMIT 1");
  const user = result.rows[0];
  console.log("User Row:", user);
  process.exit(0);
}

main().catch(console.error);
