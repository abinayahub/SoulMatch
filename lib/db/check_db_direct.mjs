import { Client } from "pg";

async function run() {
  const client = new Client({ connectionString: "postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch" });
  try {
    await client.connect();
    console.log('Connected directly to db!');
    await client.query('DROP TABLE IF EXISTS daily_poll_answers CASCADE');
    console.log('Dropped table daily_poll_answers');
  } catch (err) {
    console.error(err);
  }
  
  const res = await client.query("SELECT id, day FROM journey_questions WHERE is_active = true ORDER BY id");
  console.log("Total active questions:", res.rows.length);
  const day1 = res.rows.filter(r => r.day === 1);
  console.log("Day 1 questions length:", day1.length);
  console.log("Day 1 questions IDs:", day1.map(r => r.id).join(", "));
  
  const userRes = await client.query("SELECT id FROM users WHERE first_name = 'Nila' LIMIT 1");
  if (userRes.rows.length === 0) {
      console.log("User Nila not found");
      process.exit(1);
  }
  const userId = userRes.rows[0].id;
  const ansRes = await client.query(`SELECT question_id FROM journey_answers WHERE user_id = ${userId}`);
  console.log("Total answers for Nila:", ansRes.rows.length);
  console.log("Answered IDs:", ansRes.rows.map(r => r.question_id).join(", "));
  
  await client.end();
}

run().catch(console.error);
