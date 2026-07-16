const { Client } = require('pg');

async function check() {
  const client = new Client({ connectionString: "postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch" });
  await client.connect();

  const res = await client.query(`
    SELECT u.id, u.first_name, p.final_unified_category_scores, p.questionnaire_category_scores, p.story_category_scores
    FROM users u
    LEFT JOIN personality_profiles p ON p.user_id = u.id
    WHERE u.first_name IN ('John', 'Nila')
  `);
  
  for (const row of res.rows) {
    console.log(`\nUser: ${row.first_name} (ID: ${row.id})`);
    console.log(`Q Scores: ${row.questionnaire_category_scores}`);
    console.log(`S Scores: ${row.story_category_scores}`);
    console.log(`Unified: ${row.final_unified_category_scores}`);
  }
  
  const allUsers = await client.query(`SELECT first_name FROM users`);
  console.log(`\nAll users in DB:`, allUsers.rows.map(r => r.first_name).join(', '));

  await client.end();
}
check().catch(console.error);
