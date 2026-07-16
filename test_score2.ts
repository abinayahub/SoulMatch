import 'dotenv/config';
import pg from "pg";
import { calculateProfileCompleteness } from "./artifacts/api-server/src/lib/helpers.ts";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const result = await pool.query("SELECT * FROM users ORDER BY id DESC LIMIT 1");
  const user = result.rows[0];
  console.log("User:", user);
  
  const score = calculateProfileCompleteness(user);
  console.log("Calculated Score:", score);

  process.exit(0);
}

main().catch(console.error);
