import pg from "pg";
const { Client } = pg;
async function main() {
  const client = new Client({ connectionString: "postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch" });
  await client.connect();
  const res = await client.query("SELECT * FROM support_messages");
  console.log(res.rows);
  await client.end();
}
main();
