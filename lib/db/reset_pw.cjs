const b = require('C:\\Users\\91638\\Desktop\\SoulMatch App\\Soul-Match-AI\\node_modules\\.pnpm\\bcryptjs@3.0.3\\node_modules\\bcryptjs');
const { Pool } = require('C:\\Users\\91638\\Desktop\\SoulMatch App\\Soul-Match-AI\\lib\\db\\node_modules\\pg');

const p = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch'
});

const NEW_PASS = 'SoulMatch@123';

b.hash(NEW_PASS, 12).then(function(h) {
  return p.query("UPDATE users SET password_hash=$1 WHERE email!='testuser@soulmatch.com' RETURNING email, first_name", [h]);
}).then(function(r) {
  console.log('Reset passwords for:');
  r.rows.forEach(function(u) { console.log('  ' + u.email + ' (' + u.first_name + ')'); });
  console.log('\nNew password: ' + NEW_PASS);
  p.end();
}).catch(function(e) {
  console.error('Error:', e.message);
  p.end();
});
