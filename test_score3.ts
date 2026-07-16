import { db } from "./lib/db/src/index.ts";
import { usersTable } from "./lib/db/src/schema/users.ts";
import { eq } from "drizzle-orm";
import { buildUserProfile } from "./artifacts/api-server/src/lib/helpers.ts";

async function main() {
  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, 2) });
  console.log("Drizzle User Keys:", Object.keys(user));
  const profile = await buildUserProfile(user);
  console.log("Profile Completeness:", profile.profileCompleteness);
  process.exit(0);
}

main().catch(console.error);
