const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch',
});

async function run() {
  const fakeScores = {
    "Family Values": 22,
    "Communication Style": 18,
    "Adventure & Travel": 15,
    "Career Focus": 20,
    "Kindness & Empathy": 12,
  };
  const summary = "What Matters Most To This Person\n\nThis user highly values family connection, open communication, and is driven towards their career.";

  await pool.query(
    "UPDATE personality_profiles SET final_unified_category_scores = $1, summary = $2 WHERE final_unified_category_scores IS NULL",
    [JSON.stringify(fakeScores), summary]
  );
  console.log("Updated missing finalUnifiedCategoryScores!");
  pool.end();
}

run().catch(console.error);
