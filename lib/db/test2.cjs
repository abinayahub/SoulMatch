const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch' });

async function run() {
  const profileRes = await pool.query("SELECT * FROM personality_profiles WHERE user_id = 3");
  const currentUserProfile = profileRes.rows[0];
  
  const otherProfilesRes = await pool.query("SELECT * FROM personality_profiles WHERE user_id != 3");
  const otherProfiles = otherProfilesRes.rows;
  
  // Use calculateAndStoreCompatibility simulation
  const { calculateHybridCompatibility } = require('../artifacts/api-server/dist/services/keywordAnalysis.js');
  // Wait, I can't easily require ts files. 
  // But wait, what if I just change network-stats to match the fallback behavior and see what happens?
  pool.end();
}
run();
