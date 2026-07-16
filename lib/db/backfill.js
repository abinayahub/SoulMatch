import { Client } from "pg";

async function run() {
  const client = new Client({ connectionString: "postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch" });
  await client.connect();

  const res = await client.query("SELECT COUNT(*) FROM daily_journals");
  const count = parseInt(res.rows[0].count, 10);
  const requests = count * 2;

  const today = new Date().toISOString().split('T')[0];

  console.log(`Backfilling for ${today}: ${count} stories, ${requests} requests`);

  await client.query(`
    INSERT INTO system_metrics (date, ai_requests, stories_analyzed, cache_hits)
    VALUES ($1, $2, $3, 0)
    ON CONFLICT (date) DO UPDATE 
    SET ai_requests = EXCLUDED.ai_requests, stories_analyzed = EXCLUDED.stories_analyzed
  `, [today, requests, count]);

  console.log("Done");
  await client.end();
}

run().catch(console.error);
