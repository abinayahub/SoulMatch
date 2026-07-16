import { calculateAndStoreCompatibility } from "./src/lib/helpers.ts";
import { db } from "@workspace/db";
import { usersTable, personalityProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function run() {
  const users = await db.select().from(usersTable);
  const kavi = users.find(u => u.firstName === "Kavi");
  const mani = users.find(u => u.firstName === "Mani");
  
  if (!kavi || !mani) return process.exit(1);

  const kaviProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, kavi.id) });
  const maniProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, mani.id) });
  
  const result1 = await calculateAndStoreCompatibility(kaviProfile, maniProfile, kavi.id, mani.id);
  const result2 = await calculateAndStoreCompatibility(maniProfile, kaviProfile, mani.id, kavi.id);

  console.log("Kavi -> Mani:", result1.compatibilityScore);
  console.log("Mani -> Kavi:", result2.compatibilityScore);
  
  console.log("Kavi Breakdown:", result1.compatibilityBreakdownObj);
  console.log("Mani Breakdown:", result2.compatibilityBreakdownObj);
  process.exit(0);
}
run();
