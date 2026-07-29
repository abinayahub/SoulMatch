const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch' });
pool.query(`
CREATE TABLE IF NOT EXISTS instagram_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content VARCHAR(60) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`).then(() => console.log('TABLE CREATED')).catch(e => console.error(e)).finally(() => pool.end());
