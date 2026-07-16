import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(async () => { 
    try {
      const res = await client.query('SELECT id, email FROM users;');
      console.log('Registered Users:');
      if (res.rows.length === 0) {
        console.log('  (No users found in database)');
      } else {
        res.rows.forEach(row => console.log(`  - ${row.email} (ID: ${row.id})`));
      }
    } catch (e) {
      console.error('Error fetching users:', e.message);
    }
    client.end(); 
  })
  .catch(err => { console.error('Connection failed:', err.message); process.exit(1); });
