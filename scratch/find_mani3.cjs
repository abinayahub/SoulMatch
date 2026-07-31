const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  // Check conversations table columns
  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='conversations' ORDER BY ordinal_position");
  console.log('Columns:', cols.rows.map(r => r.column_name).join(', '));

  // Show all conversations with Mani (id=25)
  const convs = await client.query("SELECT * FROM conversations WHERE user1_id=25 OR user2_id=25 ORDER BY id");
  console.log('\nMani conversations:', JSON.stringify(convs.rows, null, 2));

  // Get names of the other users
  for (const conv of convs.rows) {
    const otherId = conv.user1_id === 25 ? conv.user2_id : conv.user1_id;
    const user = await client.query('SELECT id, first_name, last_name FROM users WHERE id=$1', [otherId]);
    console.log(`Conv ${conv.id}: other user = ${user.rows[0]?.first_name} ${user.rows[0]?.last_name}`);
  }

  await client.end();
}

run().catch(console.error);
