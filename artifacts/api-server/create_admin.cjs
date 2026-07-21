const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createUser() {
  try {
    const passwordHash = await bcrypt.hash('Abi@2004', 12);
    const client = new Client({ connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd?sslmode=require', ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    // Check if user already exists
    const check = await client.query('SELECT id FROM users WHERE email = $1', ['22csec01@gmail.com']);
    if (check.rows.length > 0) {
      console.log('User already exists, updating role and password');
      await client.query('UPDATE users SET role = $1, password_hash = $2 WHERE email = $3', ['admin', passwordHash, '22csec01@gmail.com']);
    } else {
      console.log('Creating new admin user');
      await client.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified) VALUES ($1, $2, $3, $4, $5, $6)', 
        ['22csec01@gmail.com', passwordHash, 'Admin', '', 'admin', true]
      );
    }
    console.log('Successfully setup admin account!');
    await client.end();
  } catch(e) {
    console.error(e.message);
  }
}

createUser();
