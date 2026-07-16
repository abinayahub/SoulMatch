import { db } from "./src/db";
import { usersTable, interestsTable, notificationsTable } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  const interests = await db.select().from(interestsTable);
  for (const int of interests) {
    const fromUser = userMap.get(int.fromUserId);
    const toUser = userMap.get(int.toUserId);
    if (fromUser && toUser && fromUser.gender === toUser.gender) {
      console.log(`Deleting same-gender interest: ${fromUser.firstName} (${fromUser.gender}) -> ${toUser.firstName} (${toUser.gender})`);
      await db.delete(interestsTable).where(eq(interestsTable.id, int.id));
    }
  }

  const notifications = await db.select().from(notificationsTable);
  for (const notif of notifications) {
    if (notif.actorId) {
      const fromUser = userMap.get(notif.actorId);
      const toUser = userMap.get(notif.userId);
      if (fromUser && toUser && fromUser.gender === toUser.gender) {
        console.log(`Deleting same-gender notification: ${fromUser.firstName} -> ${toUser.firstName}`);
        await db.delete(notificationsTable).where(eq(notificationsTable.id, notif.id));
      }
    }
  }

  console.log("Cleanup complete!");
  process.exit(0);
}

run().catch(console.error);
