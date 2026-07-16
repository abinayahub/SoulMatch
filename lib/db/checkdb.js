import { Client } from "pg";

async function run() {
  const client = new Client({ connectionString: "postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch" });
  await client.connect();
  const res = await client.query("SELECT * FROM daily_journals ORDER BY id DESC LIMIT 2");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
