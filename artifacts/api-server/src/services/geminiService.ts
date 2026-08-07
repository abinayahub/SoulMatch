import { db, systemMetricsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { generateAIResponse } from "./omniRouteClient";

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
  geminiRequestCount++;
  incrementApiRequest();
  console.log(`[OmniRoute API] Request #${geminiRequestCount} - Calling generateAIResponse for analyzeStory`);

  const schema = {
    type: "object",
    properties: {
      familyOrientation: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      careerFocus: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      emotionalMaturity: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      communicationOpenness: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      relationshipCommitment: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      adventureSeeking: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      socialEngagement: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      decisionMakingStyle: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      lifestyleDiscipline: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      personalGrowthMindset: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      empathyCompassion: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      financialResponsibility: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      stressHandling: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      leadershipTendency: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      trustReliability: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      summary: { type: "string", description: "A brief one-sentence summary of what this specific story says about their values." }
    },
    required: [
      "familyOrientation", "careerFocus", "emotionalMaturity", "communicationOpenness", 
      "relationshipCommitment", "adventureSeeking", "socialEngagement", "decisionMakingStyle", 
      "lifestyleDiscipline", "personalGrowthMindset", "empathyCompassion", "financialResponsibility", 
      "stressHandling", "leadershipTendency", "trustReliability", "summary"
    ],
    additionalProperties: false
  };

  const systemInstruction = `Analyze the following journal entry written by a user to determine their behavioral traits.
CRITICAL INSTRUCTIONS - STRICT ADHERENCE REQUIRED:
1. EXPLICIT EVIDENCE ONLY: You must ONLY assign High, Medium, or Low if there is direct, explicit evidence in this specific text.
2. DEFAULT TO UNKNOWN: If the entry lacks explicit evidence for a category, you MUST return "Unknown".
3. NO OVER-INFERENCING: Do NOT infer family values, career focus, or relationship commitment from unrelated activities.
4. PER-TRAIT CONFIDENCE SCORE: Provide a 'confidence' score (0-100) for EACH trait individually. If evidence for a specific trait is sparse, its confidence MUST decrease significantly.
5. SUMMARY RULES: The summary MUST ONLY mention traits and conclusions that are directly and explicitly supported by this journal text. Do not hallucinate or extrapolate.`;

  const response = await generateAIResponse(systemInstruction, `Story:\n"${story}"`, schema);
  
  if (response.error) {
    return { summary: `Error: ${response.error}` };
  }
  return response.data;
};

export const analyzeCumulativeProfile = async (stories: string[]) => {
  geminiRequestCount++;
  incrementApiRequest();
  console.log(`[OmniRoute API] Request #${geminiRequestCount} - Calling generateAIResponse for analyzeCumulativeProfile`);

  const schema = {
    type: "object",
    properties: {
      familyOrientation: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      careerFocus: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      emotionalMaturity: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      communicationOpenness: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      relationshipCommitment: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      adventureSeeking: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      socialEngagement: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      decisionMakingStyle: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      lifestyleDiscipline: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      personalGrowthMindset: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      empathyCompassion: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      financialResponsibility: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      stressHandling: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      leadershipTendency: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      trustReliability: { type: "object", properties: { value: { type: "string", description: "High, Medium, Low, or Unknown" }, evidence: { type: "string", description: "Exact quote. Empty if Unknown." }, confidence: { type: "number", description: "0-100" } }, required: ["value", "evidence", "confidence"], additionalProperties: false },
      summary: { type: "string", description: "A brief one-sentence summary of what these stories say about their values." },
      topPriorities: {
        type: "array",
        description: "Ranked list of the user's top life priorities based on the stories.",
        items: {
          type: "object",
          properties: {
            priority: { type: "string", description: "The priority, e.g., 'Family & Relationships'" },
            explanation: { type: "string", description: "Short explanation of why this matters most to them." },
            evidence: { type: "string", description: "Supporting story evidence." }
          },
          required: ["priority", "explanation", "evidence"],
          additionalProperties: false
        }
      }
    },
    required: [
      "familyOrientation", "careerFocus", "emotionalMaturity", "communicationOpenness", 
      "relationshipCommitment", "adventureSeeking", "socialEngagement", "decisionMakingStyle", 
      "lifestyleDiscipline", "personalGrowthMindset", "empathyCompassion", "financialResponsibility", 
      "stressHandling", "leadershipTendency", "trustReliability", "summary", "topPriorities"
    ],
    additionalProperties: false
  };

  const combinedStories = stories.map((s, i) => `Entry ${i + 1}:\n"${s}"`).join("\n\n");
  const systemInstruction = `Analyze the following series of chronological journal entries written by the same user to determine their overarching behavioral traits.
CRITICAL INSTRUCTIONS - STRICT ADHERENCE REQUIRED:
1. EXPLICIT EVIDENCE ONLY: You must ONLY assign High, Medium, or Low if there is direct, explicit evidence across the texts.
2. DEFAULT TO UNKNOWN: If the entries lack explicit evidence for a category, you MUST return "Unknown".
3. TOP PRIORITIES: Extract the top 1 to 5 life priorities of the user. Rank them from strongest to weakest. Provide a short explanation and supporting story evidence.
4. NO OVER-INFERENCING: Do NOT infer family values, career focus, or relationship commitment from unrelated activities. 
5. PER-TRAIT CONFIDENCE SCORE: Provide a 'confidence' score (0-100) for EACH trait individually. Update confidence based on the body of evidence.
6. SUMMARY RULES: The summary MUST ONLY mention traits and conclusions that are directly and explicitly supported by the journal text.`;

  const response = await generateAIResponse(systemInstruction, `Journals:\n${combinedStories}`, schema);
  
  if (response.error) {
    return { summary: `Error: ${response.error}` };
  }
  return response.data;
};

export const generateRelationshipSummary = async (userATraits: any, userBTraits: any) => {
  geminiRequestCount++;
  incrementApiRequest();
  console.log(`[OmniRoute API] Request #${geminiRequestCount} - Calling generateAIResponse for generateRelationshipSummary`);

  const systemInstruction = `You are a relationship AI. Based on the following two user profiles, provide a short 1-2 sentence human-readable summary of their compatibility focusing on shared strengths and potential differences. Do NOT calculate numbers or percentages.`;
  const prompt = `User A: ${JSON.stringify(userATraits)}\n\nUser B: ${JSON.stringify(userBTraits)}`;

  const response = await generateAIResponse(systemInstruction, prompt);
  
  if (response.error) {
    return "AI insights are temporarily unavailable.";
  }
  return response.data; // Returned as raw string because no schema provided
};

export const generateConversationStarters = async (userATraits: any, userBTraits: any) => {
  geminiRequestCount++;
  incrementApiRequest();
  console.log(`[OmniRoute API] Request #${geminiRequestCount} - Calling generateAIResponse for generateConversationStarters`);

  const schema = {
    type: "object",
    properties: {
      starters: {
        type: "array",
        items: { type: "string" },
        description: "An array of 5 personalized conversation starters."
      }
    },
    required: ["starters"],
    additionalProperties: false
  };

  const systemInstruction = "Generate exactly 5 personalized conversation starters based on shared interests and behavioral compatibility between these two users.";
  const prompt = `User A: ${JSON.stringify(userATraits)}\n\nUser B: ${JSON.stringify(userBTraits)}`;

  const response = await generateAIResponse(systemInstruction, prompt, schema);
  
  if (response.error) {
    return ["AI insights are temporarily unavailable."];
  }
  return response.data?.starters || ["AI insights are temporarily unavailable."];
};

export const generateMatchInsights = async (userATraits: any, userBTraits: any) => {
  geminiRequestCount++;
  incrementApiRequest();
  console.log(`[OmniRoute API] Request #${geminiRequestCount} - Calling generateAIResponse for generateMatchInsights`);

  const schema = {
    type: "object",
    properties: {
      whyYouMatch: { type: "string" },
      sharedStrengths: { type: "array", items: { type: "string" } },
      potentialDifferences: { type: "array", items: { type: "string" } },
      communicationSuggestions: { type: "array", items: { type: "string" } }
    },
    required: ["whyYouMatch", "sharedStrengths", "potentialDifferences", "communicationSuggestions"],
    additionalProperties: false
  };

  const systemInstruction = "Analyze these two user profiles and explain why they match, their shared strengths, potential differences, and communication suggestions.";
  const prompt = `User A: ${JSON.stringify(userATraits)}\n\nUser B: ${JSON.stringify(userBTraits)}`;

  const response = await generateAIResponse(systemInstruction, prompt, schema);
  
  if (response.error) {
    return { 
      whyYouMatch: "AI insights are temporarily unavailable.", 
      sharedStrengths: ["Unavailable"], 
      potentialDifferences: ["Unavailable"], 
      communicationSuggestions: ["Unavailable"] 
    };
  }
  return response.data;
};

export const generateStoryCompatibility = async (userACumulative: any, userBCumulative: any) => {
  geminiRequestCount++;
  incrementApiRequest();
  console.log(`[OmniRoute API] Request #${geminiRequestCount} - Calling generateAIResponse for generateStoryCompatibility`);

  const schema = {
    type: "object",
    properties: {
      sharedValues: { type: "array", items: { type: "string" }, description: "Top matching traits between both users based on their story data." },
      storyDifferences: { type: "array", items: { type: "string" }, description: "Traits where users differ significantly based on their story data." },
      summary: { type: "string", description: "A short explanation of why these two users may be compatible based on their story patterns." }
    },
    required: ["sharedValues", "storyDifferences", "summary"],
    additionalProperties: false
  };

  const systemInstruction = "Analyze the cumulative story analysis profiles for two users. Compare their extracted traits and determine their story-based compatibility. Extract exactly 3 shared values, 3 story differences, and a 2-sentence summary.";
  const prompt = `User A Story Profile: ${JSON.stringify(userACumulative)}\n\nUser B Story Profile: ${JSON.stringify(userBCumulative)}`;

  const response = await generateAIResponse(systemInstruction, prompt, schema);
  
  if (response.error) {
    return null;
  }
  return response.data;
};
