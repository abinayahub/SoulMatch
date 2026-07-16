require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fix() {
  const traits = [
    { trait: "Connection", score: 30 },
    { trait: "Stability", score: 10 },
    { trait: "Growth", score: 10 },
    { trait: "Exploration", score: 0 }
  ];
  
  await pool.query('UPDATE personality_profiles SET traits = $1 WHERE user_id = 1', [JSON.stringify(traits)]);
  console.log("Restored user 1 traits to:", traits);
  pool.end();
}
fix();
