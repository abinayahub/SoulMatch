const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function fixPassword() {
  const client = new Client({
    connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    // Set Mani password
    const maniHash = await bcrypt.hash('Mani@123', 12);
    await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [maniHash, 'mani@gmail.com']);
    console.log('Successfully set password Mani@123 for mani@gmail.com');

    // Set Priya password
    const priyaHash = await bcrypt.hash('Priya@123', 12);
    await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [priyaHash, 'priya@gmail.com']);
    console.log('Successfully set password Priya@123 for priya@gmail.com');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

fixPassword();
