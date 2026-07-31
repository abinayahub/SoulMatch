import app from "./app";
import { logger } from "./lib/logger";
import { seedJourneyQuestions } from "./seed_journey";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function ensureSchema() {
  try {
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS journey_completed BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS journey_completed_at TIMESTAMP;
    `);
    console.log("DB columns journey_completed & journey_completed_at ensured ✅");
  } catch (err) {
    console.error("Schema migration error:", err);
  }
}

// 1. Immediately bind app.listen so Render health check passes instantly!
app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, `Server listening on 0.0.0.0:${port}`);

  // 2. Run background seeding & schema checks asynchronously after port is bound
  ensureSchema().then(() => {
    return seedJourneyQuestions(false);
  }).catch((seedErr) => {
    logger.warn({ seedErr }, "Non-fatal background seed warning");
  });
});
