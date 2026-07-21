import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const NEW_PASSWORD = 'SoulMatch@123';

async function main() {
  console.log("[DB] Starting password reset...");
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  console.log("[DB] Hashed password successfully.");

  const allUsers = await db.select().from(usersTable);
  console.log(`[DB] Found ${allUsers.length} users in database.`);

  for (const user of allUsers) {
    await db.update(usersTable)
      .set({ passwordHash: hash })
      .where(eq(usersTable.id, user.id));
    console.log(`[DB] Updated password for: ${user.email} (${user.firstName})`);
  }

  console.log("[DB] Password reset complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("[DB] Error resetting passwords:", err);
  process.exit(1);
});
