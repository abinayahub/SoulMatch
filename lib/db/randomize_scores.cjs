const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch',
});

async function run() {
  const { rows } = await pool.query("SELECT id FROM personality_profiles");
  
  for (const row of rows) {
    // Generate varying randomized scores for each user to create diverse profiles
    const fakeScores = {
      "Family Values": Math.floor(Math.random() * 30),
      "Communication Style": Math.floor(Math.random() * 30),
      "Adventure & Travel": Math.floor(Math.random() * 30),
      "Career Focus": Math.floor(Math.random() * 30),
      "Kindness & Empathy": Math.floor(Math.random() * 30),
      "Social Engagement": Math.floor(Math.random() * 30),
      "Personal Growth": Math.floor(Math.random() * 30),
    };
    
    // Pick the top 3 traits to construct a dynamic summary
    const topTraits = Object.entries(fakeScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => t[0].toLowerCase());
    const summary = `What Matters Most To This Person\n\nThis user highly values ${topTraits[0]}, ${topTraits[1]}, and is driven towards ${topTraits[2]}.`;

    await pool.query(
      "UPDATE personality_profiles SET final_unified_category_scores = $1, summary = $2 WHERE id = $3",
      [JSON.stringify(fakeScores), summary, row.id]
    );
  }
  
  console.log(`Successfully randomized unified scores for ${rows.length} users!`);
  pool.end();
}

run().catch(console.error);
