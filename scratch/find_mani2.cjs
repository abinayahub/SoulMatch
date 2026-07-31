const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  // Find conversation-related tables
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%conv%'");
  console.log('Conversation tables:', tables.rows.map(r => r.table_name));

  // Mani is ID 25 - find her conversations
  const convs = await client.query(`
    SELECT c.id as conv_id, u.first_name, u.last_name
    FROM conversations c
    JOIN (
      SELECT conversation_id FROM conversations_users WHERE user_id = 25
    ) cu ON cu.conversation_id = c.id
    JOIN conversations_users cu2 ON cu2.conversation_id = c.id AND cu2.user_id != 25
    JOIN users u ON u.id = cu2.user_id
    ORDER BY c.id
  `);
  console.log('Mani conversations:', JSON.stringify(convs.rows, null, 2));

  await client.end();
}

run().catch(async (err) => {
  console.error('Error:', err.message);
  // Try to find real table names
  const tables2 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('All tables:', tables2.rows.map(r => r.table_name).join(', '));
  await client.end();
});
