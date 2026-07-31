import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding journey_completed and journey_completed_at columns...");
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS journey_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS journey_completed_at TIMESTAMP;
  `);
  console.log("COLUMNS ADDED SUCCESSFULLY!");

  await db.execute(sql`
    UPDATE users 
    SET journey_completed = TRUE, journey_completed_at = NOW() 
    WHERE journey_progress >= 30 
       OR id IN (
         SELECT user_id FROM journey_answers GROUP BY user_id HAVING COUNT(*) >= 30
       );
  `);
  console.log("USERS UPDATED SUCCESSFULLY!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
