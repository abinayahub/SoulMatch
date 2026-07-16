import pg from "pg";
const { Pool } = pg;
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch" });
  const res = await pool.query("SELECT * FROM support_messages");
  console.log("ROWS IN DB:", res.rows);
  process.exit(0);
}
main();
