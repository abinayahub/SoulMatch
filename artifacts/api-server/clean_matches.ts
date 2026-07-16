import { db } from "@workspace/db";
import { interestsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const interests = await db.select().from(interestsTable);
  const users = await db.select().from(usersTable);
  
  const usersMap = new Map(users.map(u => [u.id, u]));
  
  let deletedCount = 0;
  for (const interest of interests) {
    const fromUser = usersMap.get(interest.fromUserId);
    const toUser = usersMap.get(interest.toUserId);
    
    if (fromUser && toUser && fromUser.gender === toUser.gender) {
      console.log(`Deleting match between ${fromUser.firstName} (${fromUser.gender}) and ${toUser.firstName} (${toUser.gender})`);
      await db.delete(interestsTable).where(eq(interestsTable.id, interest.id));
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} invalid same-gender matches.`);
}

main().catch(console.error).finally(() => process.exit(0));
