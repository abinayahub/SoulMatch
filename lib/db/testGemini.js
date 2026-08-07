import "dotenv/config";
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({
    model: "gemini/gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          familyOrientation: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          careerFocus: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          summary: { type: SchemaType.STRING, description: "A brief one-sentence summary of what these stories say about their values." },
          topPriorities: {
            type: SchemaType.ARRAY,
            description: "Ranked list of the user's top life priorities based on the stories.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                priority: { type: SchemaType.STRING, description: "The priority, e.g., 'Family & Relationships'" },
                explanation: { type: SchemaType.STRING, description: "Short explanation of why this matters most to them." },
                evidence: { type: SchemaType.STRING, description: "Supporting story evidence." }
              },
              required: ["priority", "explanation", "evidence"]
            }
          }
        },
        required: [
          "familyOrientation", "careerFocus", "summary", "topPriorities"
        ]
      }
    }
  });

  const stories = ["Busy with project work", "Spending quality time with friends", "Going on a trip with friends"];
  const combinedStories = stories.map((s, i) => `Entry ${i + 1}:\n"${s}"`).join("\n\n");

  const prompt = `Analyze the following series of chronological journal entries written by the same user to determine their overarching behavioral traits.
CRITICAL INSTRUCTIONS:
1. EXPLICIT EVIDENCE ONLY: Assign High, Medium, or Low ONLY if there is direct, explicit evidence. Otherwise return "Unknown".
2. OVERALL TRENDS: Look for patterns across the entries.
3. PER-TRAIT CONFIDENCE SCORE: Provide a 'confidence' score (0-100).
4. SUMMARY RULES: Ensure the summary is grounded directly in the text.
5. TOP PRIORITIES: Identify the top 1 to 5 most important life priorities for this user based on the evidence.

Stories:
${combinedStories}`;

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (e) {
    console.error("ERROR:", e);
  }
}

run();
