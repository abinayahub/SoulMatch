import pg from "pg";
const { Pool } = pg;
async function main() {
  const pool = new Pool({ connectionString: "postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch" });
  const res = await pool.query("SELECT id, role FROM users LIMIT 5");
  console.log("USERS:", res.rows);
  
  // also check how many support_messages
  const res2 = await pool.query("SELECT id FROM support_messages");
  console.log("SUPPORT MESSAGES:", res2.rows.length);
  process.exit(0);
}
main();
