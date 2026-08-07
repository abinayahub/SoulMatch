export const DEFAULT_AI_MODEL = "gemini/gemini-3-flash-preview";
export const FALLBACK_AI_MODEL = "groq/llama-3.3-70b-versatile";
export const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1";
export const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || "";

if (!OMNIROUTE_API_KEY) {
  console.warn("WARNING: OMNIROUTE_API_KEY is not set in environment variables. AI functionality will be severely limited.");
}
