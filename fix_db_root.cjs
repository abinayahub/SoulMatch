require('dotenv').config({ path: 'artifacts/api-server/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const result = await pool.query("SELECT id FROM personality_profiles");
  for (const row of result.rows) {
    const fakeScores = {
      "Family Values": Math.floor(Math.random() * 80) + 20,
      "Communication Style": Math.floor(Math.random() * 80) + 20,
      "Adventure & Travel": Math.floor(Math.random() * 80) + 20,
      "Career Focus": Math.floor(Math.random() * 80) + 20,
      "Kindness & Empathy": Math.floor(Math.random() * 80) + 20,
      "Relationship Commitment": Math.floor(Math.random() * 80) + 20,
      "Emotional Wellbeing": Math.floor(Math.random() * 80) + 20,
      "Personal Growth": Math.floor(Math.random() * 80) + 20,
      "Social Engagement": Math.floor(Math.random() * 80) + 20,
      "Health & Lifestyle": Math.floor(Math.random() * 80) + 20,
    };
    
    await pool.query(
      "UPDATE personality_profiles SET final_unified_category_scores = $1 WHERE id = $2",
      [JSON.stringify(fakeScores), row.id]
    );
  }
  
  await pool.query("DELETE FROM compatibility_scores");
  
  console.log("Updated random finalUnifiedCategoryScores and cleared cache!");
  pool.end();
}

run().catch(console.error);
