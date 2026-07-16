import { db } from "@workspace/db";
import { interestsTable } from "@workspace/db";

async function main() {
  await db.insert(interestsTable).values([
    {
      fromUserId: 4, // Mani (male)
      toUserId: 1, // Kavi (female)
      status: "accepted"
    },
    {
      fromUserId: 3, // Abinaya (female)
      toUserId: 4, // Mani (male)
      status: "pending"
    }
  ]);
  
  console.log("Mock matches inserted successfully!");
}

main().catch(console.error).finally(() => process.exit(0));
