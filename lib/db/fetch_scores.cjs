const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch',
});

async function run() {
  const { rows: users } = await pool.query(
    `SELECT u.id, u.first_name, p.questionnaire_category_scores, p.story_category_scores, p.final_unified_category_scores 
     FROM users u 
     LEFT JOIN personality_profiles p ON u.id = p.user_id 
     WHERE u.first_name IN ('Hari', 'Mani', 'Kishore') OR u.id = 1`
  );
  
  console.log(JSON.stringify(users, null, 2));
  pool.end();
}

run().catch(console.error);
