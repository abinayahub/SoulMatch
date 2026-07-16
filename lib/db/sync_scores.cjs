require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sync() {
  const { rows: users } = await pool.query('SELECT id FROM users');
  for (const user of users) {
    const { rows: answers } = await pool.query('SELECT answer FROM journey_answers WHERE user_id = $1', [user.id]);
    
    let scores = {
      Connection: 0,
      Growth: 0,
      Stability: 0,
      Exploration: 0
    };
    
    for (const row of answers) {
      if (row.answer.startsWith('A.')) scores.Connection++;
      else if (row.answer.startsWith('B.')) scores.Growth++;
      else if (row.answer.startsWith('C.')) scores.Stability++;
      else if (row.answer.startsWith('D.')) scores.Exploration++;
    }
    
    const traits = [
      { trait: "Connection", score: scores.Connection },
      { trait: "Growth", score: scores.Growth },
      { trait: "Stability", score: scores.Stability },
      { trait: "Exploration", score: scores.Exploration }
    ];
    
    await pool.query('UPDATE personality_profiles SET traits = $1 WHERE user_id = $2', [JSON.stringify(traits), user.id]);
    console.log(`Synced user ${user.id} traits:`, scores);
  }
  pool.end();
}
sync();
