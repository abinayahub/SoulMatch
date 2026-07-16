import 'dotenv/config';
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const result = await pool.query("SELECT * FROM users ORDER BY id DESC LIMIT 1;");
  const user = result.rows[0];
  console.log("Current user:", user);
  
  const fields = [
    "firstName", "lastName", "dateOfBirth", "gender", "bio",
    "height", "weight", "maritalStatus",
    "occupation", "company", "education", "fieldOfStudy", "industry", "annualIncomeRange",
    "country", "stateRegion", "city", "citizenship", "languages", "religion"
  ];
  
  console.log("\nMissing fields:");
  for (const f of fields) {
    // Note: column names in PG might be snake_case, but let's check what comes back
    const val = user[f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)];
    if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) {
      console.log("- " + f);
    }
  }
  process.exit(0);
}
main();
