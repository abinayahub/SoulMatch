const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd?sslmode=require', ssl: { rejectUnauthorized: false } });
client.connect().then(async () => {
  try {
    const userId = 5;
    await client.query('DELETE FROM support_messages WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM admin_logs WHERE admin_id = $1', [userId]);
    await client.query('UPDATE platform_settings SET updated_by = NULL WHERE updated_by = $1', [userId]);
    await client.query('DELETE FROM profile_views WHERE viewer_id = $1 OR target_user_id = $1', [userId]);
    await client.query('DELETE FROM daily_poll_answers WHERE user_id = $1', [userId]);
    
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('Successfully deleted user 5');
  } catch (err) {
    console.error('DELETE ERROR:', err.message);
  } finally {
    client.end();
  }
});
