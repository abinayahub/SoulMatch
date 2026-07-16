// Reset all existing user passwords to "SoulMatch@123"
import { createRequire } from 'module';
import { createHash } from 'crypto';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch'
});

const NEW_PASSWORD = 'SoulMatch@123';

async function main() {
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  console.log('New password hash:', hash);

  // Get all users
  const { rows: users } = await pool.query(
    "SELECT id, email, first_name FROM users WHERE email != 'testuser@soulmatch.com' ORDER BY id"
  );

  console.log(`\nResetting passwords for ${users.length} users...\n`);

  for (const user of users) {
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hash, user.id]
    );
    console.log(`✅ Reset: ${user.email} (${user.first_name})`);
  }

  console.log('\n✅ All passwords reset to: SoulMatch@123');
  console.log('\nUsers can now log in with:');
  console.log('  Email: their registered email');
  console.log('  Password: SoulMatch@123');
  
  await pool.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  pool.end();
  process.exit(1);
});
