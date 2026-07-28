const { Client } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  const client = new Client({ connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch' });
  await client.connect();
  const passwordHash = await bcrypt.hash('Abi@2004', 12);
  const check = await client.query('SELECT id FROM users WHERE email = $1', ['22csec01@gmail.com']);
  if (check.rows.length > 0) {
    await client.query('UPDATE users SET role = $1, password_hash = $2 WHERE email = $3', ['admin', passwordHash, '22csec01@gmail.com']);
    console.log('Updated existing user to admin with correct password');
  } else {
    await client.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified) VALUES ($1, $2, $3, $4, $5, $6)', 
      ['22csec01@gmail.com', passwordHash, 'Admin', '', 'admin', true]
    );
    console.log('Created new admin user');
  }
  await client.end();
})();
