const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch',
});

async function run() {
  const { rows } = await pool.query(
    "SELECT id, user_id, questionnaire_category_scores, story_category_scores, final_unified_category_scores FROM personality_profiles ORDER BY id LIMIT 3"
  );
  
  if (rows.length < 2) {
    console.log("Not enough users to compare.");
    return;
  }
  
  const userA = rows[0];
  const userB = rows[1];
  const userC = rows[2];
  
  console.log("--- User A (ID: " + userA.user_id + ") ---");
  console.log("Questionnaire:", userA.questionnaire_category_scores);
  console.log("Story:", userA.story_category_scores);
  console.log("Final Unified:", userA.final_unified_category_scores);
  console.log("");
  
  console.log("--- User B (ID: " + userB.user_id + ") ---");
  console.log("Questionnaire:", userB.questionnaire_category_scores);
  console.log("Story:", userB.story_category_scores);
  console.log("Final Unified:", userB.final_unified_category_scores);
  console.log("");
  
  console.log("--- User C (ID: " + userC.user_id + ") ---");
  console.log("Questionnaire:", userC.questionnaire_category_scores);
  console.log("Story:", userC.story_category_scores);
  console.log("Final Unified:", userC.final_unified_category_scores);
  console.log("");

  // Print cosine similarity simulation
  function calculateSimilarity(scoresA, scoresB) {
    if (!scoresA || !scoresB) return 0;
    const a = typeof scoresA === 'string' ? JSON.parse(scoresA) : scoresA;
    const b = typeof scoresB === 'string' ? JSON.parse(scoresB) : scoresB;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    const categories = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const c of categories) {
      const valA = a[c] || 0;
      const valB = b[c] || 0;
      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }
    
    if (normA === 0 || normB === 0) return 0; // Fix zero division
    return Math.round((dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))) * 100);
  }
  
  console.log("--- Compatibility Calculation ---");
  console.log("User A vs User B Compatibility:", calculateSimilarity(userA.final_unified_category_scores, userB.final_unified_category_scores) + "%");
  console.log("User A vs User C Compatibility:", calculateSimilarity(userA.final_unified_category_scores, userC.final_unified_category_scores) + "%");
  console.log("Zero Vector vs Zero Vector Compatibility:", calculateSimilarity({}, {}));
  
  pool.end();
}

run().catch(console.error);
