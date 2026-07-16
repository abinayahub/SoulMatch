import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { dailyJournalsTable } from "./src/schema/index.js";
import { desc } from "drizzle-orm";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function check() {
  const res = await db.select().from(dailyJournalsTable).orderBy(desc(dailyJournalsTable.createdAt)).limit(3);
  console.log(JSON.stringify(res, null, 2));
  pool.end();
}
check();
