require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SchemaType = require('@google/generative-ai').SchemaType;

async function run() {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          familyOrientation: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          careerFocus: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          emotionalMaturity: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          summary: { type: SchemaType.STRING, description: "A brief one-sentence summary of what this specific story says about their values." }
        },
        required: [
          "familyOrientation", "careerFocus", "emotionalMaturity", "summary"
        ]
      }
    }
  });

  const prompt = `Analyze the following journal entry written by a user to determine their behavioral traits.
CRITICAL INSTRUCTIONS - STRICT ADHERENCE REQUIRED:
1. EXPLICIT EVIDENCE ONLY: You must ONLY assign High, Medium, or Low if there is direct, explicit evidence in this specific text.
2. DEFAULT TO UNKNOWN: If the entry lacks explicit evidence for a category, you MUST return "Unknown".
3. NO OVER-INFERENCING: Do NOT infer family values, career focus, or relationship commitment from unrelated activities.
4. PER-TRAIT CONFIDENCE SCORE: Provide a 'confidence' score (0-100) for EACH trait individually. If evidence for a specific trait is sparse, its confidence MUST decrease significantly.
5. SUMMARY RULES: The summary MUST ONLY mention traits and conclusions that are directly and explicitly supported by this journal text. Do not hallucinate or extrapolate.

Story:
"Moved to a new place and used the app to meet people"`;

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (e) {
    console.error(e);
  }
}

run();
