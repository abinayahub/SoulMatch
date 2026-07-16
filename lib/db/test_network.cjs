const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch' });

async function run() {
  // Fetch user 3
  const userRes = await pool.query("SELECT * FROM users WHERE id = 3");
  const currentUser = userRes.rows[0];

  const blockedRes = await pool.query("SELECT blocked_id FROM blocked_users WHERE blocker_id = 3");
  const blockedIds = blockedRes.rows.map(r => r.blocked_id);

  const oppositeGender = currentUser.gender === "male" ? "female" : currentUser.gender === "female" ? "male" : null;

  let query = "SELECT id, created_at FROM users WHERE id != 3";
  if (oppositeGender) {
    query += ` AND gender = '${oppositeGender}'`;
  }
  const eligibleUsersRes = await pool.query(query);
  const eligibleUsers = eligibleUsersRes.rows;
  const eligibleUserIds = eligibleUsers.filter(u => !blockedIds.includes(u.id)).map(u => u.id);
  
  console.log("Eligible users:", eligibleUserIds.length);

  const profileRes = await pool.query("SELECT * FROM personality_profiles WHERE user_id = 3");
  const currentUserProfile = profileRes.rows[0];
  let unifiedScoresA = {};
  if (currentUserProfile && currentUserProfile.final_unified_category_scores) {
    try { unifiedScoresA = JSON.parse(currentUserProfile.final_unified_category_scores); } catch (e) {}
  }
  console.log("Unified Scores A:", unifiedScoresA);

  const otherProfilesRes = await pool.query(`SELECT user_id, final_unified_category_scores FROM personality_profiles WHERE user_id = ANY($1::int[])`, [eligibleUserIds]);
  const otherProfiles = otherProfilesRes.rows;
  console.log("Other profiles found:", otherProfiles.length);

  // Implement the calculateDetailedInsights logic here to test it
  let totalMatches = 0;
  for (const p of otherProfiles) {
    let unifiedScoresB = {};
    if (p.final_unified_category_scores) {
      try { unifiedScoresB = JSON.parse(p.final_unified_category_scores); } catch (e) {}
    }
    
    // Simulate calculateDetailedInsights
    if (Object.keys(unifiedScoresA).length === 0 || Object.keys(unifiedScoresB).length === 0) {
      // overallCompatibility = null
    } else {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      const categories = new Set([...Object.keys(unifiedScoresA), ...Object.keys(unifiedScoresB)]);
      for (const c of categories) {
        const valA = unifiedScoresA[c] || 0;
        const valB = unifiedScoresB[c] || 0;
        dotProduct += valA * valB;
        normA += valA * valA;
        normB += valB * valB;
      }
      if (normA !== 0 && normB !== 0) {
        const overall = Math.round((dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))) * 100);
        if (overall >= 60) totalMatches++;
      }
    }
  }

  console.log("Total Matches Calculated:", totalMatches);
  pool.end();
}
run();
