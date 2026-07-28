const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch' });

async function run() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  
  try {
    const res = await pool.query('DELETE FROM users WHERE created_at < $1 RETURNING email', [cutoff]);
    console.log('Deleted ' + res.rowCount + ' old users:', res.rows.map(r => r.email).join(', '));
  } catch (err) {
    console.error('Delete failed:', err.message);
  }
  pool.end();
}

run();
