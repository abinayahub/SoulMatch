require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function showData() {
  const { rows: profiles } = await pool.query('SELECT * FROM personality_profiles WHERE user_id = 1');
  console.log("=== YOUR PERSONALITY PROFILE ===");
  console.log(JSON.stringify(profiles[0], null, 2));

  const { rows: answers } = await pool.query('SELECT question_id, answer FROM journey_answers WHERE user_id = 1 ORDER BY id DESC LIMIT 5');
  console.log("\n=== YOUR 5 MOST RECENT ANSWERS ===");
  console.log(JSON.stringify(answers, null, 2));
  
  const { rows: users } = await pool.query('SELECT id, first_name, display_name, journey_progress FROM users WHERE id = 1');
  console.log("\n=== YOUR USER RECORD ===");
  console.log(JSON.stringify(users[0], null, 2));

  pool.end();
}
showData();
