import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

import { db, systemMetricsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

let geminiRequestCount = 0;

const incrementMetric = async (field: 'aiRequests' | 'storiesAnalyzed' | 'cacheHits') => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const existing = await db.query.systemMetricsTable.findFirst({
      where: eq(systemMetricsTable.date, today)
    });
    if (existing) {
      await db.update(systemMetricsTable)
        .set({ [field]: sql`${systemMetricsTable[field]} + 1` })
        .where(eq(systemMetricsTable.date, today));
    } else {
      const init = { date: today, aiRequests: 0, storiesAnalyzed: 0, cacheHits: 0 };
      init[field] = 1;
      await db.insert(systemMetricsTable).values(init);
    }
  } catch (e) {
    console.error("Metrics update error:", e);
  }
};

export const incrementApiRequest = () => incrementMetric('aiRequests');
export const incrementStoryAnalyzed = () => incrementMetric('storiesAnalyzed');
export const incrementCacheHit = () => incrementMetric('cacheHits');


export const analyzeStory = async (story: string) => {
  if (!apiKey) return { summary: "AI insights are temporarily unavailable." };
  
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
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
            summary: { type: SchemaType.STRING, description: "A brief one-sentence summary of what this specific story says about their values." }
          },
          required: [
            "familyOrientation", "careerFocus", "emotionalMaturity", "communicationOpenness", 
            "relationshipCommitment", "adventureSeeking", "socialEngagement", "decisionMakingStyle", 
            "lifestyleDiscipline", "personalGrowthMindset", "empathyCompassion", "financialResponsibility", 
            "stressHandling", "leadershipTendency", "trustReliability", "summary"
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
"${story}"`;
    geminiRequestCount++;
    incrementApiRequest();
    console.log(`[Gemini API] Request #${geminiRequestCount} - Calling generateContent (Model: gemini-2.5-flash) for analyzeStory`);
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini analyzeStory Error:", error);
    return { summary: `Error: ${error.message}` };
  }
};

export const analyzeCumulativeProfile = async (stories: string[]) => {
  if (!apiKey) return { summary: "AI insights are temporarily unavailable." };
  
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
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

    const combinedStories = stories.map((s, i) => `Entry ${i + 1}:\n"${s}"`).join("\n\n");

    const prompt = `Analyze the following series of chronological journal entries written by the same user to determine their overarching behavioral traits.
CRITICAL INSTRUCTIONS - STRICT ADHERENCE REQUIRED:
1. EXPLICIT EVIDENCE ONLY: You must ONLY assign High, Medium, or Low if there is direct, explicit evidence across the texts.
2. DEFAULT TO UNKNOWN: If the entries lack explicit evidence for a category, you MUST return "Unknown".
3. TOP PRIORITIES: Extract the top 1 to 5 life priorities of the user (e.g. Family & Relationships, Social Connections, Personal Growth, Adventure & Exploration, Career & Ambition). Rank them from strongest to weakest. Provide a short explanation and supporting story evidence for each priority.
4. NO OVER-INFERENCING: Do NOT infer family values, career focus, or relationship commitment from unrelated activities (e.g., outdoor activities, hiking, or hobbies alone). 
5. PER-TRAIT CONFIDENCE SCORE: Provide a 'confidence' score (0-100) for EACH trait individually. Update confidence based on the body of evidence.
6. SUMMARY RULES: The summary MUST ONLY mention traits and conclusions that are directly and explicitly supported by the journal text.

Journals:
${combinedStories}`;
    geminiRequestCount++;
    incrementApiRequest();
    console.log(`[Gemini API] Request #${geminiRequestCount} - Calling generateContent (Model: gemini-2.5-flash) for analyzeCumulativeProfile`);
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini analyzeCumulativeProfile Error:", error);
    return { summary: `Error: ${error.message}` };
  }
};

export const generateRelationshipSummary = async (userATraits: any, userBTraits: any) => {
  if (!apiKey) return "AI insights are temporarily unavailable.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a relationship AI. Based on the following two user profiles, provide a short 1-2 sentence human-readable summary of their compatibility focusing on shared strengths and potential differences. Do NOT calculate numbers or percentages.\n\nUser A: ${JSON.stringify(userATraits)}\n\nUser B: ${JSON.stringify(userBTraits)}`;
    geminiRequestCount++;
    incrementApiRequest();
    console.log(`[Gemini API] Request #${geminiRequestCount} - Calling generateContent (Model: gemini-2.5-flash) for generateRelationshipSummary`);
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini generateRelationshipSummary Error:", error);
    return "AI insights are temporarily unavailable.";
  }
};

export const generateConversationStarters = async (userATraits: any, userBTraits: any) => {
  if (!apiKey) return ["AI insights are temporarily unavailable."];

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "An array of 5 personalized conversation starters."
        }
      }
    });
    
    const prompt = `Based on these two users' traits, generate exactly 5 personalized conversation starters based on shared interests and behavioral compatibility.\n\nUser A: ${JSON.stringify(userATraits)}\n\nUser B: ${JSON.stringify(userBTraits)}`;
    geminiRequestCount++;
    incrementApiRequest();
    console.log(`[Gemini API] Request #${geminiRequestCount} - Calling generateContent (Model: gemini-2.5-flash) for generateConversationStarters`);
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini generateConversationStarters Error:", error);
    return ["AI insights are temporarily unavailable."];
  }
};

export const generateMatchInsights = async (userATraits: any, userBTraits: any) => {
  if (!apiKey) return { 
    whyYouMatch: "AI insights are temporarily unavailable.", 
    sharedStrengths: ["Unavailable"], 
    potentialDifferences: ["Unavailable"], 
    communicationSuggestions: ["Unavailable"] 
  };

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            whyYouMatch: { type: SchemaType.STRING },
            sharedStrengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            potentialDifferences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            communicationSuggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          },
          required: ["whyYouMatch", "sharedStrengths", "potentialDifferences", "communicationSuggestions"]
        }
      }
    });

    const prompt = `Analyze these two user profiles and explain why they match, their shared strengths, potential differences, and communication suggestions.\n\nUser A: ${JSON.stringify(userATraits)}\n\nUser B: ${JSON.stringify(userBTraits)}`;
    geminiRequestCount++;
    incrementApiRequest();
    console.log(`[Gemini API] Request #${geminiRequestCount} - Calling generateContent (Model: gemini-2.5-flash) for generateMatchInsights`);
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini generateMatchInsights Error:", error);
    return { 
      whyYouMatch: "AI insights are temporarily unavailable.", 
      sharedStrengths: ["Unavailable"], 
      potentialDifferences: ["Unavailable"], 
      communicationSuggestions: ["Unavailable"] 
    };
  }
};

export const generateStoryCompatibility = async (userACumulative: any, userBCumulative: any) => {
  if (!apiKey) return null;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            sharedValues: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Top matching traits between both users based on their story data." },
            storyDifferences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Traits where users differ significantly based on their story data." },
            summary: { type: SchemaType.STRING, description: "A short explanation of why these two users may be compatible based on their story patterns." }
          },
          required: ["sharedValues", "storyDifferences", "summary"]
        }
      }
    });

    const prompt = `Analyze the cumulative story analysis profiles for two users. Compare their extracted traits (e.g. Family Orientation, Career Focus, Social Engagement, etc.) and determine their story-based compatibility.\n\nUser A Story Profile: ${JSON.stringify(userACumulative)}\n\nUser B Story Profile: ${JSON.stringify(userBCumulative)}\n\nExtract exactly 3 shared values, 3 story differences, and a 2-sentence summary.`;
    geminiRequestCount++;
    incrementApiRequest();
    console.log(`[Gemini API] Request #${geminiRequestCount} - Calling generateContent (Model: gemini-2.5-flash) for generateStoryCompatibility`);
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini generateStoryCompatibility Error:", error);
    return null;
  }
};
