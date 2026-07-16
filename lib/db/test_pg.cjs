require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const { rows } = await pool.query('SELECT * FROM journey_answers WHERE user_id = 1 ORDER BY id ASC');
  console.log(rows);
  pool.end();
}
check();
