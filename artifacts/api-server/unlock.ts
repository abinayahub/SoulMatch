import { db, journeyAnswersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Bypassing time locks...");
  
  // Subtract 24 hours from all answers' created_at (PostgreSQL syntax)
  await db.update(journeyAnswersTable).set({
    createdAt: sql`created_at - interval '1 day'`
  });
  
  console.log("Success! You can now access Day 2.");
  process.exit(0);
}

main().catch(console.error);
