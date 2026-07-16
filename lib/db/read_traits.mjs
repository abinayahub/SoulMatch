import { db } from "./src/index.js";
import { personalityProfilesTable, usersTable } from "./src/schema/index.js";
import { eq } from "drizzle-orm";

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

  process.exit(0);
}

run();
