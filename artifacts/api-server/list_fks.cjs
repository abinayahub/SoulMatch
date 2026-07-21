const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://soulmatch_db_xsfd_user:hhVHqlk3abVzqiH8omdVewvvdywBj72C@dpg-d9c8m1urnols73e1cb2g-a.virginia-postgres.render.com/soulmatch_db_xsfd?sslmode=require', ssl: { rejectUnauthorized: false } });
client.connect().then(() => client.query(`
  SELECT
    tc.table_name, kcu.column_name, rc.delete_rule
  FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
  WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND kcu.table_name != 'users' 
    AND EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage AS ccu 
      WHERE ccu.constraint_name = tc.constraint_name AND ccu.table_name = 'users'
    )
`)).then(r => { console.log(JSON.stringify(r.rows, null, 2)); client.end(); }).catch(e => { console.error('DB Error:', e.message); client.end(); });
