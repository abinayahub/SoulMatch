import "dotenv/config";
import { analyzeStory } from "./src/services/geminiService";

async function run() {
  const res = await analyzeStory("Just went for a walk.");
  console.log("Result:", res);
}

run().catch(console.error);
