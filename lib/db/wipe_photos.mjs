import 'dotenv/config';
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await pool.query("DELETE FROM photos");
  console.log("Deleted all photos");
  process.exit(0);
}

main().catch(console.error);
