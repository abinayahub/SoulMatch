import { db } from "@workspace/db";
import { personalityProfilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { calculateAndStoreCompatibility } from "./src/lib/helpers.ts";

async function run() {
  const users = await db.select().from(usersTable);
  const kavi = users.find(u => u.firstName === "Kavi");
  const mani = users.find(u => u.firstName === "Mani");
  
  if (!kavi || !mani) {
    console.log("Could not find Kavi or Mani");
    process.exit(1);
  }

  const kaviProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, kavi.id) });
  const maniProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, mani.id) });
  
  console.log("Kavi Traits:", kaviProfile?.traits);
  console.log("Mani Traits:", maniProfile?.traits);

  const result = await calculateAndStoreCompatibility(kaviProfile, maniProfile, kavi.id, mani.id);
  console.log("Result:", result);

  process.exit(0);
}

run();
