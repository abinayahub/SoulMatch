import { analyzeStory } from "./src/lib/openai.js";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  try {
    console.log("Testing OpenAI with key:", process.env.OPENAI_API_KEY ? "Present" : "Missing");
    const result = await analyzeStory("I am going to native");
    console.log("SUCCESS:", result);
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}
test();
