import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export const CORE_THEMES = [
  "Family", "Career", "Education", "Health", "Travel", 
  "Friendship", "Relationships", "Personal Growth", 
  "Spirituality", "Lifestyle", "Pets", "Food", "Finance"
];

export const CORE_VALUES = [
  "Connection", "Kindness", "Ambition", "Exploration", 
  "Empathy", "Discipline", "Curiosity", "Resilience"
];

export interface StoryAnalysisResult {
  themes: Record<string, number>;
  values: Record<string, number>;
  emotion: "Positive" | "Neutral" | "Negative";
}

export interface CumulativeStoryProfile {
  totalStories: number;
  storyMaturity: number;
  profileConfidence: "Low" | "Medium" | "High";
  themes: Record<string, number>;
  values: Record<string, number>;
  emotions: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export async function analyzeStoryContextually(content: string): Promise<StoryAnalysisResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("No API key");
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an advanced semantic analyzer. Read the provided personal story and extract exactly 1-3 Core Themes from this list: [${CORE_THEMES.join(", ")}]. Then map those themes to 1-3 Core Values from this list: [${CORE_VALUES.join(", ")}]. Finally, determine the primary Emotional Tone (Positive, Neutral, Negative). Return JSON strictly matching this schema: { "themes": { "ThemeName": 1 }, "values": { "ValueName": 1 }, "emotion": "Positive" }`
        },
        { role: "user", content }
      ],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      themes: parsed.themes || {},
      values: parsed.values || {},
      emotion: parsed.emotion || "Neutral"
    };
  } catch (e) {
    console.log("[StoryEngine] Using fallback contextual parser due to API unavailability.");
    // Fallback deterministic logic
    const lower = content.toLowerCase();
    const result: StoryAnalysisResult = { themes: {}, values: {}, emotion: "Neutral" };
    
    if (lower.includes("mom") || lower.includes("dad") || lower.includes("family")) {
      result.themes["Family"] = 1;
      result.values["Connection"] = 1;
      result.values["Kindness"] = 1;
    }
    if (lower.includes("work") || lower.includes("job") || lower.includes("career")) {
      result.themes["Career"] = 1;
      result.values["Ambition"] = 1;
    }
    if (lower.includes("trip") || lower.includes("travel")) {
      result.themes["Travel"] = 1;
      result.values["Exploration"] = 1;
    }
    
    if (Object.keys(result.themes).length === 0) {
      result.themes["Lifestyle"] = 1;
      result.values["Curiosity"] = 1;
    }
    
    if (lower.includes("happy") || lower.includes("great") || lower.includes("love")) {
      result.emotion = "Positive";
    } else if (lower.includes("sad") || lower.includes("bad") || lower.includes("angry") || lower.includes("hard")) {
      result.emotion = "Negative";
    }
    
    return result;
  }
}

export function generateCumulativeStoryProfile(
  newAnalysis: StoryAnalysisResult, 
  currentProfile?: CumulativeStoryProfile
): CumulativeStoryProfile {
  
  const profile: CumulativeStoryProfile = currentProfile || {
    totalStories: 0,
    storyMaturity: 0,
    profileConfidence: "Low",
    themes: {},
    values: {},
    emotions: { positive: 0, neutral: 0, negative: 0 }
  };
  
  profile.totalStories += 1;
  
  // Calculate Maturity and Confidence
  // Cap maturity at 1.0 (assuming 10 stories is "High" confidence)
  profile.storyMaturity = Math.min(1.0, profile.totalStories / 10);
  if (profile.storyMaturity >= 0.8) profile.profileConfidence = "High";
  else if (profile.storyMaturity >= 0.4) profile.profileConfidence = "Medium";
  else profile.profileConfidence = "Low";
  
  for (const [theme, score] of Object.entries(newAnalysis.themes)) {
    profile.themes[theme] = (profile.themes[theme] || 0) + score;
  }
  
  for (const [value, score] of Object.entries(newAnalysis.values)) {
    profile.values[value] = (profile.values[value] || 0) + score;
  }
  
  const eKey = newAnalysis.emotion.toLowerCase() as "positive"|"neutral"|"negative";
  if (profile.emotions[eKey] !== undefined) {
    profile.emotions[eKey] += 1;
  }
  
  return profile;
}

export function generateStorySummary(profile: CumulativeStoryProfile): string {
  if (!profile || profile.totalStories === 0) {
    return "Not enough stories posted yet to generate a profile.";
  }
  
  const topThemes = Object.entries(profile.themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(e => e[0]);
    
  const topValues = Object.entries(profile.values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(e => e[0]);
    
  let tone = "Neutral";
  if (profile.emotions.positive >= profile.emotions.negative && profile.emotions.positive >= profile.emotions.neutral) tone = "Positive";
  else if (profile.emotions.negative > profile.emotions.positive) tone = "Negative";

  return `Your stories reveal a strong foundation in ${topValues.join(" and ")}. You frequently engage in ${topThemes.join(" and ")}, and your overall expression style tends to be highly ${tone}.`;
}

export function calculateStoryCompatibility(profileA?: CumulativeStoryProfile, profileB?: CumulativeStoryProfile) {
  if (!profileA || !profileB || profileA.totalStories === 0 || profileB.totalStories === 0) {
    return { storyMatchScore: 0, insight: "Not enough stories to compare." };
  }
  
  // 1. Values Alignment (40%)
  let vDot = 0, vMagA = 0, vMagB = 0;
  const allValues = new Set([...Object.keys(profileA.values), ...Object.keys(profileB.values)]);
  for (const v of allValues) {
    const a = profileA.values[v] || 0;
    const b = profileB.values[v] || 0;
    vDot += a * b;
    vMagA += a * a;
    vMagB += b * b;
  }
  const vSim = (vMagA && vMagB) ? (vDot / (Math.sqrt(vMagA) * Math.sqrt(vMagB))) : 0;
  const valueScore = vSim * 40;
  
  // 2. Lifestyle/Themes Alignment (30%)
  let tDot = 0, tMagA = 0, tMagB = 0;
  const allThemes = new Set([...Object.keys(profileA.themes), ...Object.keys(profileB.themes)]);
  for (const t of allThemes) {
    const a = profileA.themes[t] || 0;
    const b = profileB.themes[t] || 0;
    tDot += a * b;
    tMagA += a * a;
    tMagB += b * b;
  }
  const tSim = (tMagA && tMagB) ? (tDot / (Math.sqrt(tMagA) * Math.sqrt(tMagB))) : 0;
  const themeScore = tSim * 30;
  
  // 3. Emotional Compatibility (30%)
  // Simple check: if both dominant tones are similar, they get higher points.
  const getDominant = (em: {positive: number, neutral: number, negative: number}) => {
    if (em.positive >= em.negative && em.positive >= em.neutral) return "positive";
    if (em.negative > em.positive && em.negative >= em.neutral) return "negative";
    return "neutral";
  };
  const domA = getDominant(profileA.emotions);
  const domB = getDominant(profileB.emotions);
  
  let emoScore = 15; // baseline
  if (domA === domB) emoScore = 30;
  else if ((domA === "positive" && domB === "neutral") || (domA === "neutral" && domB === "positive")) emoScore = 25;
  else if ((domA === "negative" && domB === "positive") || (domA === "positive" && domB === "negative")) emoScore = 10;
  
  const rawStoryMatchScore = valueScore + themeScore + emoScore;
  
  // Apply joint maturity penalty so a single shared story doesn't result in 100% compatibility
  const jointMaturity = Math.sqrt(profileA.storyMaturity * profileB.storyMaturity);
  const storyMatchScore = Math.round(rawStoryMatchScore * jointMaturity);
  
  const commonThemes = [...allThemes].filter(t => profileA.themes[t] > 0 && profileB.themes[t] > 0);
  const topTheme = commonThemes.sort((a,b) => ((profileA.themes[b]||0)+(profileB.themes[b]||0)) - ((profileA.themes[a]||0)+(profileB.themes[a]||0)))[0] || "lifestyle";
  
  let insight = `You share a ${storyMatchScore}% behavioral alignment based on your stories (Confidence: ${jointMaturity >= 0.8 ? "High" : jointMaturity >= 0.4 ? "Medium" : "Low"}).`;
  if (storyMatchScore > 75) insight = `You both express strong alignment in ${topTheme}, sharing very similar values and emotional styles.`;
  
  return { storyMatchScore, rawStoryMatchScore, jointMaturity, insight, themeAlignment: tSim, valueAlignment: vSim };
}
