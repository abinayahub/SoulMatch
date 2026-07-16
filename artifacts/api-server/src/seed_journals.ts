import { dailyJournalsTable, usersTable, db } from "@workspace/db";
// @ts-ignore
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function seed() {
  const users = await db.select().from(usersTable).limit(5);
  if (users.length === 0) {
    console.log("No users found to author stories.");
    process.exit(0);
  }

  const journalsToInsert = [
    {
      userId: users[0]?.id || users[users.length - 1].id,
      content: "A Chance Meeting That Changed Everything\nSometimes the universe works in mysterious ways to bring two people together. We met at a coffee shop...",
      imageUrl: "https://images.unsplash.com/photo-1518133835878-5a93ac3f000c?w=400&q=80",
    },
    {
      userId: users[1]?.id || users[0].id,
      content: "Learning to Love Myself First\nThis journey taught me that self-love is not selfish. It's necessary before you can truly love someone else.",
      imageUrl: null,
    },
    {
      userId: users[2]?.id || users[0].id,
      content: "We Said Yes! Our SoulMatch Journey\nFrom matching to marriage, here's our story of finding each other across the country.",
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80",
    },
    {
      userId: users[3]?.id || users[0].id,
      content: "Overcoming Long Distance\nDistance tested us, but our bond made us stronger. Here are our tips for making it work.",
      imageUrl: null,
    },
    {
      userId: users[4]?.id || users[0].id,
      content: "Finding Peace in Solitude\nBeing single is not a curse, it's a blessing to discover who you really are.",
      imageUrl: null,
    },
    {
      userId: users[0]?.id || users[0].id,
      content: "Our First Date Story\nFrom awkward silences to endless conversations...",
      imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80",
    },
    {
      userId: users[1]?.id || users[0].id,
      content: "Still Healing, But Growing\nIt's okay to not be okay. Healing is a journey, and I'm taking it one day at a time.",
      imageUrl: null,
    }
  ];

  await db.insert(dailyJournalsTable).values(journalsToInsert);
  console.log("Successfully seeded journals/stories!");
  process.exit(0);
}

seed().catch(console.error);
