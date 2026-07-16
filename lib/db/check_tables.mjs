import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd',
  ssl: { rejectUnauthorized: false }
});

try {
  const r = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log('Tables in DB:', r.rows.map(r => r.tablename).join(', '));

  // Try to query users table
  const u = await pool.query('SELECT COUNT(*) as cnt FROM users');
  console.log('Users count:', u.rows[0].cnt);
} catch(e) {
  console.error('ERROR:', e.message);
} finally {
  await pool.end();
}
