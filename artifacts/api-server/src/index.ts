import app from "./app";
import { logger } from "./lib/logger";
import { seedJourneyQuestions } from "./seed_journey";

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

seedJourneyQuestions(false)
  .catch((err) => {
    logger.warn({ err }, "Warning: Journey questions seed skipped due to error");
  })
  .finally(() => {
    app.listen(port, "0.0.0.0", (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening on 0.0.0.0");
    });
  });
