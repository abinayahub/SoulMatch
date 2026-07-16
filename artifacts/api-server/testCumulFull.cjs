
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          familyOrientation: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          careerFocus: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          emotionalMaturity: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          communicationOpenness: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          relationshipCommitment: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          adventureSeeking: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          socialEngagement: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          decisionMakingStyle: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          lifestyleDiscipline: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          personalGrowthMindset: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          empathyCompassion: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          financialResponsibility: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          stressHandling: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          leadershipTendency: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
          trustReliability: { type: SchemaType.OBJECT, properties: { value: { type: SchemaType.STRING, description: "High, Medium, Low, or Unknown" }, evidence: { type: SchemaType.STRING, description: "Exact quote. Empty if Unknown." }, confidence: { type: SchemaType.NUMBER, description: "0-100" } }, required: ["value", "evidence", "confidence"] },
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
          "familyOrientation", "careerFocus", "emotionalMaturity", "communicationOpenness", 
          "relationshipCommitment", "adventureSeeking", "socialEngagement", "decisionMakingStyle", 
          "lifestyleDiscipline", "personalGrowthMindset", "empathyCompassion", "financialResponsibility", 
          "stressHandling", "leadershipTendency", "trustReliability", "summary", "topPriorities"
        ]
      }
    }
  });

  const stories = [
    "I have an busy schedule today because lots of pending work in my projects",
    "Today I am spend quality time with my friends",
    "Going on a trip with friends"
  ];
  const combinedStories = stories.map((s, i) => `Entry ${i + 1}:\n"${s}"`).join("\n\n");

  const prompt = `Analyze the following series of chronological journal entries written by the same user to determine their overarching behavioral traits.
CRITICAL INSTRUCTIONS - STRICT ADHERENCE REQUIRED:
1. EXPLICIT EVIDENCE ONLY: You must ONLY assign High, Medium, or Low if there is direct, explicit evidence across the texts.
2. DEFAULT TO UNKNOWN: If the entries lack explicit evidence for a category, you MUST return "Unknown".
3. TOP PRIORITIES: Extract the top 1 to 5 life priorities of the user (e.g. Family & Relationships, Social Connections, Personal Growth, Adventure & Exploration, Career & Ambition). Rank them from strongest to weakest. Provide a short explanation and supporting story evidence for each priority.
4. NO OVER-INFERENCING: Do NOT infer family values, career focus, or relationship commitment from unrelated activities. 
5. PER-TRAIT CONFIDENCE SCORE: Provide a 'confidence' score (0-100) for EACH trait individually. Update confidence based on the body of evidence.
6. SUMMARY RULES: The summary MUST ONLY mention traits and conclusions that are directly and explicitly supported by the journal text.

Journals:
${combinedStories}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    console.log(JSON.parse(text));
  } catch (error) {
    console.error("Gemini analyzeCumulativeProfile Error:", error);
  }
}

run();
