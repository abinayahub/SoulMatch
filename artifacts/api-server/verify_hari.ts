import { db, usersTable, personalityProfilesTable, compatibilityScoresTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import fetch from "node-fetch"; // or built-in fetch in Node 18+

async function run() {
  console.log("=== DB Verification ===");
  // Find Hari
  const users = await db.select().from(usersTable);
  const viewer = users.find((u: any) => u.id === 1); // Assuming 1 is viewer
  const hari = users.find((u: any) => u.firstName === "Hari");

  if (!hari) {
    console.log("Could not find Hari in DB.");
    return;
  }
  console.log(`Viewer: ${viewer?.firstName} (ID: ${viewer?.id})`);
  console.log(`Matched: ${hari.firstName} (ID: ${hari.id})`);

  const hariProfile = await db.query.personalityProfilesTable.findFirst({
    where: eq(personalityProfilesTable.userId, hari.id)
  });

  console.log("\n--- SELECT personality profile & story profile for Hari ---");
  if (hariProfile) {
    console.log("questionnaireCategoryScores:", hariProfile.questionnaireCategoryScores);
    console.log("storyCategoryScores:", hariProfile.storyCategoryScores);
    console.log("traits:", hariProfile.traits);
  } else {
    console.log("No personality profile found for Hari.");
  }

  const compCache = await db.query.compatibilityScoresTable.findFirst({
    where: or(
      and(eq(compatibilityScoresTable.userAId, viewer!.id), eq(compatibilityScoresTable.userBId, hari.id)),
      and(eq(compatibilityScoresTable.userAId, hari.id), eq(compatibilityScoresTable.userBId, viewer!.id))
    )
  });

  console.log("\n--- SELECT compatibility cache ---");
  if (compCache) {
    console.log(compCache);
  } else {
    console.log("No compatibility cache found for this match.");
  }

  console.log("\n=== API Verification ===");
  // Call the actual API server on port 5000 (running locally)
  // But wait, the API requires auth. I will generate a fake token or just bypass.
  // Actually, I can just call calculateAndStoreCompatibility directly to see what it returns, 
  // since that's what the API does.
  const { calculateAndStoreCompatibility } = await import("../../custom_helpers.ts");
  
  const viewerProfile = await db.query.personalityProfilesTable.findFirst({
    where: eq(personalityProfilesTable.userId, viewer!.id)
  });

  const result = await calculateAndStoreCompatibility(viewerProfile, hariProfile, viewer!.id, hari.id);
  console.log("\nAPI Compatibility Output JSON:");
  console.log(JSON.stringify(result, null, 2));

  process.exit(0);
}

run().catch(console.error);
