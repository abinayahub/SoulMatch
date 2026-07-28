const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch'
});

async function main() {
  const { rows: users } = await pool.query('SELECT id, email, first_name FROM users');
  
  for (const user of users) {
    if (!user.first_name) continue;
    // Capitalize first letter of first_name
    const name = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase();
    const password = name + '@123';
    
    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user.id]);
    console.log('Updated ' + user.email + ' to ' + password);
  }
  
  await pool.end();
}

main().catch(err => { console.error(err); pool.end(); });
