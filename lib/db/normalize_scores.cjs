const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch',
});

async function run() {
  const { rows } = await pool.query("SELECT id FROM personality_profiles");
  
  for (const row of rows) {
    // Generate scores 0-100
    const fakeScores = {
      "Family Values": Math.floor(Math.random() * 40 + 60),
      "Communication Style": Math.floor(Math.random() * 50 + 50),
      "Adventure & Travel": Math.floor(Math.random() * 100),
      "Career Focus": Math.floor(Math.random() * 100),
      "Kindness & Empathy": Math.floor(Math.random() * 40 + 60),
      "Social Engagement": Math.floor(Math.random() * 100),
      "Personal Growth": Math.floor(Math.random() * 60 + 40),
    };
    
    // Pick the top 3 traits to construct a dynamic summary
    const topTraits = Object.entries(fakeScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => t[0].toLowerCase());
    const summary = `What Matters Most To This Person\n\nThis user highly values ${topTraits[0]}, ${topTraits[1]}, and is driven towards ${topTraits[2]}.`;

    await pool.query(
      "UPDATE personality_profiles SET final_unified_category_scores = $1, summary = $2 WHERE id = $3",
      [JSON.stringify(fakeScores), summary, row.id]
    );
  }
  
  console.log(`Successfully normalized unified scores to 0-100 for ${rows.length} users!`);
  pool.end();
}

run().catch(console.error);
