import { db } from '@workspace/db';
import { usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

const email = process.argv[2];
if (!email || email.includes('actual.email')) {
  console.log('Please provide your real email address. Example: npx tsx make_admin.ts you@example.com');
  process.exit(1);
}

try {
  const result = await db.update(usersTable).set({ role: 'admin' }).where(eq(usersTable.email, email)).returning();
  if (result.length > 0) {
    console.log(`Successfully made ${email} an admin!`);
  } else {
    console.log(`Could not find a user with the email ${email}.`);
  }
} catch (e) {
  console.error("Error updating user:", e);
}
process.exit(0);
