import 'dotenv/config';
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const result = await pool.query("SELECT * FROM users WHERE id = 1");
  const user = result.rows[0];
  console.log("User 1 Row:", user);
  process.exit(0);
}

main().catch(console.error);
