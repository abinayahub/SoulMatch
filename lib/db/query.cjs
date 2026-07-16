const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch' });

async function run() {
  const users = await pool.query("SELECT id, first_name FROM users WHERE first_name = 'Abinaya'");
  console.log("Abinaya:", users.rows);
  const scores = await pool.query("SELECT user_a_id, user_b_id, score, created_at FROM compatibility_scores ORDER BY created_at DESC LIMIT 5");
  console.log("Scores:", scores.rows);
  pool.end();
}
run();
