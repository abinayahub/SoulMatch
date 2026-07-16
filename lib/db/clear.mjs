import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.query('DELETE FROM compatibility_scores')
  .then(res => {
    console.log('Deleted rows:', res.rowCount);
    return pool.end();
  })
  .catch(err => {
    console.error(err);
    return pool.end();
  });
