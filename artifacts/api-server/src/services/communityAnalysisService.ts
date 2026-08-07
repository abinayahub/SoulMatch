// Community Analysis Service

import { generateAIResponse } from "./omniRouteClient";

export const communityAnalysisService = {
  // TODO: Implement community analysis features
};

export async function analyzeCommunityAnswer(question: string, answer: string) {
  const schema = {
    type: "object",
    properties: {
      communication: { type: "number" },
      empathy: { type: "number" },
      respect: { type: "number" },
      patience: { type: "number" },
      supportiveness: { type: "number" },
      relationshipMaturity: { type: "number" },
      problemSolving: { type: "number" },
      summary: { type: "string" }
    },
    required: [
      "communication", "empathy", "respect", "patience", 
      "supportiveness", "relationshipMaturity", "problemSolving", "summary"
    ],
    additionalProperties: false
  };

  const systemInstruction = "You are a relationship behavior analysis assistant. Return ONLY valid JSON.";
  const prompt = `
Question:
${question}

Answer:
${answer}

Analyze the responder only.
`;

  const response = await generateAIResponse(systemInstruction, prompt, schema);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data;
}
