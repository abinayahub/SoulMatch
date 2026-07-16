import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { personalityProfilesTable } from "./src/schema/journey.js";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function mockUnifiedScores() {
  const profiles = await db.select().from(personalityProfilesTable);
  console.log(`Found ${profiles.length} profiles to update.`);
  for (const profile of profiles) {
    if (!profile.finalUnifiedCategoryScores) {
      // Create some random balanced unified scores based on old traits
      const fakeScores = {
        "Family Values": Math.floor(Math.random() * 20) + 10,
        "Communication Style": Math.floor(Math.random() * 20) + 10,
        "Adventure & Travel": Math.floor(Math.random() * 20) + 10,
        "Career Focus": Math.floor(Math.random() * 20) + 10,
        "Kindness & Empathy": Math.floor(Math.random() * 20) + 10,
      };
      
      const summary = "What Matters Most To This Person\n\nThis user highly values family connection, open communication, and is driven towards their career.";
      
      await db.update(personalityProfilesTable)
        .set({ 
          finalUnifiedCategoryScores: JSON.stringify(fakeScores),
          summary: summary
        })
        .where(eq(personalityProfilesTable.id, profile.id));
      console.log(`Updated profile ID: ${profile.id}`);
    }
  }
  console.log("Done updating profiles.");
  process.exit(0);
}

mockUnifiedScores().catch(console.error);
