// Reset all existing user passwords to "SoulMatch@123"
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch'
});

const NEW_PASSWORD = 'SoulMatch@123';

async function main() {
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);

  const { rows: users } = await pool.query(
    "SELECT id, email, first_name FROM users WHERE email != 'testuser@soulmatch.com' ORDER BY id"
  );

  console.log(`Resetting passwords for ${users.length} users...\n`);

  for (const user of users) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user.id]);
    console.log(`✅ ${user.email} (${user.first_name})`);
  }

  console.log('\nAll passwords reset to: SoulMatch@123');
  await pool.end();
}

main().catch(err => { console.error('Error:', err.message); pool.end(); process.exit(1); });
