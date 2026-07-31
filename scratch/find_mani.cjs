const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  // Find mani user
  const users = await client.query("SELECT id, first_name, last_name, email FROM users WHERE lower(first_name) LIKE 'mani%' ORDER BY id");
  console.log('=== MANI USERS ===');
  console.log(JSON.stringify(users.rows, null, 2));

  if (users.rows.length > 0) {
    const maniId = users.rows[0].id;
    // Find mani's conversations
    const convs = await client.query(`
      SELECT c.id, u.first_name, u.last_name
      FROM conversations c
      JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = $1
      JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id != $1
      JOIN users u ON u.id = cp2.user_id
      ORDER BY c.id
    `, [maniId]);
    console.log('\n=== MANI CONVERSATIONS ===');
    console.log(JSON.stringify(convs.rows, null, 2));
  }

  await client.end();
}

run().catch(console.error);
