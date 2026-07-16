require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const { rows } = await pool.query('SELECT id, traits FROM personality_profiles');
  for (const row of rows) {
    if (row.traits) {
      try {
        let parsed = JSON.parse(row.traits);
        let traitsArray = [];
        if (Array.isArray(parsed)) {
          traitsArray = parsed;
        } else if (parsed && typeof parsed === 'object') {
          traitsArray = Object.keys(parsed).map(key => ({
            trait: parsed[key].trait || key,
            score: parsed[key].score || parsed[key]
          }));
        }
        
        let changed = false;
        for (const t of traitsArray) {
          if (t.score >= 10 && t.score % 10 === 0) {
            t.score = t.score / 10;
            changed = true;
          }
        }
        
        if (changed) {
          await pool.query('UPDATE personality_profiles SET traits = $1 WHERE id = $2', [JSON.stringify(traitsArray), row.id]);
          console.log(`Migrated traits for profile ${row.id}`);
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
  }
  console.log("Migration complete");
  pool.end();
}
migrate();
