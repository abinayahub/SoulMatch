import "dotenv/config";
import { buildPublicProfile } from "./artifacts/api-server/src/lib/helpers.ts";

async function run() {
  const p = await buildPublicProfile(2, 1);
  console.log("Compatibility Score:", p?.compatibilityScore);
  process.exit(0);
}

run();
