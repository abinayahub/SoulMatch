import { db } from "@workspace/db";
import { usersTable, interestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  // 3. Insert a couple of male users
  const [rahul] = await db.insert(usersTable).values({
    firstName: "Rahul",
    lastName: "S",
    email: "r@sm.ai",
    passwordHash: "mock_hash",
    gender: "male",
    dateOfBirth: new Date("1995-05-15"),
    role: "user",
    status: "active"
  }).returning();

  const [vikram] = await db.insert(usersTable).values({
    firstName: "Vikram",
    lastName: "K",
    email: "v@sm.ai",
    passwordHash: "mock_hash",
    gender: "male",
    dateOfBirth: new Date("1993-08-22"),
    role: "user",
    status: "active"
  }).returning();

  console.log("Inserted male users:", rahul.firstName, vikram.firstName);

  // 4. Create new valid boy-girl matches
  // rahul (male) <-> kavi (female, id: 1)
  // vikram (male) <-> abinaya (female, id: 3)
  // rahul (male) <-> mani (female, id: 4)
  await db.insert(interestsTable).values([
    {
      fromUserId: rahul.id,
      toUserId: 1, // Kavi
      status: "accepted"
    },
    {
      fromUserId: 3, // Abinaya
      toUserId: vikram.id,
      status: "pending"
    },
    {
      fromUserId: rahul.id,
      toUserId: 4, // Mani
      status: "accepted"
    }
  ]);

  console.log("Successfully inserted new valid Boy-Girl matches!");
}

main().catch(console.error).finally(() => process.exit(0));
