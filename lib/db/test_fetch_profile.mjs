import 'dotenv/config';
import { db } from './src/index.js';
import { usersTable, personalityProfilesTable } from './src/schema/index.js';
import { eq } from 'drizzle-orm';

async function test() {
  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, 1) });
  const profile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, 1) });
  console.log("Profile:", profile);
}
test();
