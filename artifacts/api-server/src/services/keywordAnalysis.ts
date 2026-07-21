export const UNIFIED_CATEGORIES = [
  "Family Values",
  "Relationship Commitment",
  "Communication Style",
  "Emotional Wellbeing",
  "Career Focus",
  "Personal Growth",
  "Social Engagement",
  "Adventure & Travel",
  "Health & Lifestyle",
  "Kindness & Empathy",
] as const;

export type UnifiedCategory = typeof UNIFIED_CATEGORIES[number];

export const KEYWORD_MAP: Record<string, UnifiedCategory> = {
  // Family Values (50 Keywords + regional terms)
  "family": "Family Values", "families": "Family Values", "parent": "Family Values", "parents": "Family Values", "mother": "Family Values", "mom": "Family Values", "mum": "Family Values", "father": "Family Values", "dad": "Family Values", "grandmother": "Family Values", "grandfather": "Family Values", "grandparents": "Family Values", "brother": "Family Values", "sister": "Family Values", "sibling": "Family Values", "uncle": "Family Values", "aunt": "Family Values", "cousin": "Family Values", "relative": "Family Values", "relatives": "Family Values", "home": "Family Values", "household": "Family Values", "family dinner": "Family Values", "family trip": "Family Values", "family function": "Family Values", "family gathering": "Family Values", "support family": "Family Values", "care family": "Family Values", "respect parents": "Family Values", "elder": "Family Values", "elders": "Family Values", "traditional": "Family Values", "family time": "Family Values", "bonding": "Family Values", "love family": "Family Values", "responsibility": "Family Values", "guidance": "Family Values", "caregiving": "Family Values", "togetherness": "Family Values", "reunion": "Family Values", "celebration": "Family Values", "festival": "Family Values", "wedding": "Family Values", "marriage": "Family Values", "anniversary": "Family Values", "birthday": "Family Values", "child": "Family Values", "children": "Family Values", "family support": "Family Values", "native": "Family Values", "hometown": "Family Values", "village": "Family Values",

  // Career Focus (50 Keywords)
  "career": "Career Focus", "job": "Career Focus", "work": "Career Focus", "office": "Career Focus", "employee": "Career Focus", "employer": "Career Focus", "project": "Career Focus", "projects": "Career Focus", "task": "Career Focus", "deadline": "Career Focus", "meeting": "Career Focus", "presentation": "Career Focus", "promotion": "Career Focus", "salary": "Career Focus", "income": "Career Focus", "business": "Career Focus", "startup": "Career Focus", "company": "Career Focus", "internship": "Career Focus", "training": "Career Focus", "learning": "Career Focus", "course": "Career Focus", "certification": "Career Focus", "certificate": "Career Focus", "skill": "Career Focus", "skills": "Career Focus", "development": "Career Focus", "goal": "Career Focus", "goals": "Career Focus", "achievement": "Career Focus", "success": "Career Focus", "professional": "Career Focus", "networking": "Career Focus", "leadership": "Career Focus", "management": "Career Focus", "productivity": "Career Focus", "performance": "Career Focus", "growth": "Career Focus", "career growth": "Career Focus", "opportunity": "Career Focus", "opportunities": "Career Focus", "research": "Career Focus", "technology": "Career Focus", "coding": "Career Focus", "programming": "Career Focus", "software": "Career Focus", "engineer": "Career Focus", "developer": "Career Focus", "future career": "Career Focus",

  // Personal Growth (50 Keywords)
  "improve": "Personal Growth", "improvement": "Personal Growth", "develop": "Personal Growth", "learn": "Personal Growth", "knowledge": "Personal Growth", "book": "Personal Growth", "books": "Personal Growth", "reading": "Personal Growth", "habit": "Personal Growth", "discipline": "Personal Growth", "practice": "Personal Growth", "challenge": "Personal Growth", "motivation": "Personal Growth", "inspiration": "Personal Growth", "mindset": "Personal Growth", "reflection": "Personal Growth", "self reflection": "Personal Growth", "self improvement": "Personal Growth", "self awareness": "Personal Growth", "confidence": "Personal Growth", "courage": "Personal Growth", "focus": "Personal Growth", "consistency": "Personal Growth", "progress": "Personal Growth", "experience": "Personal Growth", "lesson": "Personal Growth", "mistake": "Personal Growth", "dream": "Personal Growth", "future": "Personal Growth", "planning": "Personal Growth", "personal development": "Personal Growth", "skill building": "Personal Growth", "education": "Personal Growth", "study": "Personal Growth", "adapt": "Personal Growth", "change": "Personal Growth", "growth journey": "Personal Growth", "improvement plan": "Personal Growth", "learning journey": "Personal Growth", "evolve": "Personal Growth", "energized": "Personal Growth",

  // Social Engagement (50 Keywords)
  "friend": "Social Engagement", "friends": "Social Engagement", "friendship": "Social Engagement", "group": "Social Engagement", "team": "Social Engagement", "community": "Social Engagement", "party": "Social Engagement", "social": "Social Engagement", "socialize": "Social Engagement", "hangout": "Social Engagement", "outing": "Social Engagement", "event": "Social Engagement", "network": "Social Engagement",  "chat": "Social Engagement", "gathering": "Social Engagement", "club": "Social Engagement", "organization": "Social Engagement", "colleague": "Social Engagement", "coworker": "Social Engagement", "support group": "Social Engagement", "volunteer": "Social Engagement", "get together": "Social Engagement", "social life": "Social Engagement", "interaction": "Social Engagement", "connect": "Social Engagement", "connection": "Social Engagement", "relationship": "Social Engagement", "people": "Social Engagement", "public": "Social Engagement", "crowd": "Social Engagement", "guest": "Social Engagement", "host": "Social Engagement", "discussion": "Social Engagement", "cooperation": "Social Engagement", "collaboration": "Social Engagement", "helping others": "Social Engagement", "social activity": "Social Engagement", "companionship": "Social Engagement", "meetup": "Social Engagement", "teamwork": "Social Engagement", "community service": "Social Engagement", "social support": "Social Engagement", "friend circle": "Social Engagement",

  // Adventure & Travel (50 Keywords)
  "trip": "Adventure & Travel", "travel": "Adventure & Travel", "journey": "Adventure & Travel", "vacation": "Adventure & Travel", "tour": "Adventure & Travel", "tourism": "Adventure & Travel", "explore": "Adventure & Travel", "exploring": "Adventure & Travel", "adventure": "Adventure & Travel", "adventurous": "Adventure & Travel", "camping": "Adventure & Travel", "trekking": "Adventure & Travel", "hiking": "Adventure & Travel", "road trip": "Adventure & Travel", "flight": "Adventure & Travel", "airport": "Adventure & Travel", "beach": "Adventure & Travel", "mountain": "Adventure & Travel", "hill station": "Adventure & Travel", "destination": "Adventure & Travel", "holiday": "Adventure & Travel", "resort": "Adventure & Travel", "hotel": "Adventure & Travel", "backpacking": "Adventure & Travel", "nature": "Adventure & Travel", "forest": "Adventure & Travel", "waterfall": "Adventure & Travel", "lake": "Adventure & Travel", "river": "Adventure & Travel", "island": "Adventure & Travel", "discover": "Adventure & Travel", "discovery": "Adventure & Travel", "new place": "Adventure & Travel", "new city": "Adventure & Travel", "culture": "Adventure & Travel", "sightseeing": "Adventure & Travel", "photography": "Adventure & Travel", "weekend trip": "Adventure & Travel", "travel plan": "Adventure & Travel", "travel experience": "Adventure & Travel", "travel memories": "Adventure & Travel", "international": "Adventure & Travel", "local trip": "Adventure & Travel", "exploration": "Adventure & Travel", "travel partner": "Adventure & Travel", "adventure activity": "Adventure & Travel", "campfire": "Adventure & Travel", "travel goal": "Adventure & Travel",

  // Kindness & Empathy (50 Keywords)
  "help": "Kindness & Empathy", "helped": "Kindness & Empathy", "helping": "Kindness & Empathy", "support": "Kindness & Empathy", "supported": "Kindness & Empathy", "care": "Kindness & Empathy", "caring": "Kindness & Empathy", "kind": "Kindness & Empathy", "kindness": "Kindness & Empathy", "empathy": "Kindness & Empathy", "compassion": "Kindness & Empathy", "respect": "Kindness & Empathy", "understanding": "Kindness & Empathy", "listen": "Kindness & Empathy", "listening": "Kindness & Empathy", "encourage": "Kindness & Empathy", "encouragement": "Kindness & Empathy", "donate": "Kindness & Empathy", "donation": "Kindness & Empathy", "charity": "Kindness & Empathy", "mentor": "Kindness & Empathy", "mentoring": "Kindness & Empathy", "forgive": "Kindness & Empathy", "forgiveness": "Kindness & Empathy", "patience": "Kindness & Empathy", "patient": "Kindness & Empathy", "share": "Kindness & Empathy", "sharing": "Kindness & Empathy", "comfort": "Kindness & Empathy", "comforting": "Kindness & Empathy", "love": "Kindness & Empathy", "affection": "Kindness & Empathy", "concern": "Kindness & Empathy", "assist": "Kindness & Empathy", "assistance": "Kindness & Empathy", "service": "Kindness & Empathy", "generosity": "Kindness & Empathy", "grateful": "Kindness & Empathy", "gratitude": "Kindness & Empathy", "uplift": "Kindness & Empathy", "motivate": "Kindness & Empathy", "encouraging": "Kindness & Empathy", "supportive": "Kindness & Empathy", "good deed": "Kindness & Empathy", "sympathy": "Kindness & Empathy",

  // Health & Lifestyle (approx 50 Keywords)
  "gym": "Health & Lifestyle", "workout": "Health & Lifestyle", "exercise": "Health & Lifestyle", "fitness": "Health & Lifestyle", "running": "Health & Lifestyle", "walking": "Health & Lifestyle", "healthy": "Health & Lifestyle", "lifestyle": "Health & Lifestyle", "diet": "Health & Lifestyle", "yoga": "Health & Lifestyle", "meditation": "Health & Lifestyle", "jogging": "Health & Lifestyle", "marathon": "Health & Lifestyle", "weights": "Health & Lifestyle", "wellness": "Health & Lifestyle", "nutrition": "Health & Lifestyle", "vegan": "Health & Lifestyle", "health": "Health & Lifestyle", "active": "Health & Lifestyle", "sport": "Health & Lifestyle", "sports": "Health & Lifestyle", "athletics": "Health & Lifestyle", "cycling": "Health & Lifestyle", "swimming": "Health & Lifestyle", "stretch": "Health & Lifestyle", "stretching": "Health & Lifestyle", "fit": "Health & Lifestyle", "cardio": "Health & Lifestyle", "protein": "Health & Lifestyle", "habits": "Health & Lifestyle", "routine": "Health & Lifestyle", "sleep": "Health & Lifestyle", "hydration": "Health & Lifestyle", "detox": "Health & Lifestyle", "therapy": "Health & Lifestyle", "organic": "Health & Lifestyle", "muscle": "Health & Lifestyle", "energetic": "Health & Lifestyle", "vitality": "Health & Lifestyle", "physical": "Health & Lifestyle", "well-being": "Health & Lifestyle", "stamina": "Health & Lifestyle", "endurance": "Health & Lifestyle",

  // Communication Style (approx 50 Keywords)
  "talk": "Communication Style", "discuss": "Communication Style", "conversation": "Communication Style", "communicate": "Communication Style", "understand": "Communication Style", "express": "Communication Style", "open": "Communication Style", "honest": "Communication Style", "honesty": "Communication Style", "direct": "Communication Style", "voice": "Communication Style", "articulate": "Communication Style", "speak": "Communication Style", "speaking": "Communication Style", "argument": "Communication Style", "debate": "Communication Style", "dialogue": "Communication Style", "negotiate": "Communication Style", "feedback": "Communication Style", "transparent": "Communication Style", "transparency": "Communication Style", "clarity": "Communication Style", "clear": "Communication Style", "responsive": "Communication Style", "respond": "Communication Style", "reply": "Communication Style", "nonverbal": "Communication Style", "tone": "Communication Style", "empathetic": "Communication Style", "confront": "Communication Style", "confrontational": "Communication Style", "diplomatic": "Communication Style", "tactful": "Communication Style", "respectful": "Communication Style", "language": "Communication Style", "speech": "Communication Style", "message": "Communication Style", "meaningful": "Communication Style", "depth": "Communication Style", "vocal": "Communication Style",

  // Relationship Commitment (approx 50 Keywords)
  "partner": "Relationship Commitment", "trust": "Relationship Commitment", "commitment": "Relationship Commitment", "future together": "Relationship Commitment", "bond": "Relationship Commitment", "dating": "Relationship Commitment", "date": "Relationship Commitment", "boyfriend": "Relationship Commitment", "girlfriend": "Relationship Commitment", "husband": "Relationship Commitment", "wife": "Relationship Commitment", "spouse": "Relationship Commitment", "engaged": "Relationship Commitment", "engagement": "Relationship Commitment", "loyal": "Relationship Commitment", "loyalty": "Relationship Commitment", "devoted": "Relationship Commitment", "devotion": "Relationship Commitment", "steady": "Relationship Commitment", "serious": "Relationship Commitment", "intimate": "Relationship Commitment", "intimacy": "Relationship Commitment", "romantic": "Relationship Commitment", "romance": "Relationship Commitment", "pair": "Relationship Commitment", "companion": "Relationship Commitment", "soulmate": "Relationship Commitment", "forever": "Relationship Commitment", "vow": "Relationship Commitment", "vows": "Relationship Commitment", "dedicated": "Relationship Commitment", "dedication": "Relationship Commitment", "fidelity": "Relationship Commitment", "unconditional": "Relationship Commitment", "cherish": "Relationship Commitment", "adore": "Relationship Commitment", "promise": "Relationship Commitment", "secure": "Relationship Commitment", "security": "Relationship Commitment", "attachment": "Relationship Commitment",

  // Emotional Wellbeing (approx 50 Keywords)
  "calm": "Emotional Wellbeing", "reflect": "Emotional Wellbeing", "accept": "Emotional Wellbeing", "emotion": "Emotional Wellbeing", "emotions": "Emotional Wellbeing", "emotional": "Emotional Wellbeing", "self-control": "Emotional Wellbeing", "balance": "Emotional Wellbeing", "balanced": "Emotional Wellbeing", "stable": "Emotional Wellbeing", "stability": "Emotional Wellbeing", "mindful": "Emotional Wellbeing", "mindfulness": "Emotional Wellbeing", "heal": "Emotional Wellbeing", "healing": "Emotional Wellbeing", "aware": "Emotional Wellbeing", "awareness": "Emotional Wellbeing", "compose": "Emotional Wellbeing", "composure": "Emotional Wellbeing", "resilient": "Emotional Wellbeing", "resilience": "Emotional Wellbeing", "grounded": "Emotional Wellbeing", "trigger": "Emotional Wellbeing", "process": "Emotional Wellbeing", "regulate": "Emotional Wellbeing", "regulation": "Emotional Wellbeing", "rational": "Emotional Wellbeing", "mature": "Emotional Wellbeing", "maturity": "Emotional Wellbeing", "thoughtful": "Emotional Wellbeing", "handle": "Emotional Wellbeing", "manage": "Emotional Wellbeing", "cope": "Emotional Wellbeing", "coping": "Emotional Wellbeing", "sad": "Emotional Wellbeing", "feel": "Emotional Wellbeing", "feeling": "Emotional Wellbeing", "happy": "Emotional Wellbeing", "angry": "Emotional Wellbeing", "upset": "Emotional Wellbeing", "stress": "Emotional Wellbeing", "stressed": "Emotional Wellbeing"
};

export function analyzeStoryKeywords(
  text: string, 
  currentScores: Record<string, number> = {}
): { updatedScores: Record<string, number>, storyScores: Record<string, number>, matchedKeywords: string[] } {
  const words = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
  const updatedScores = { ...currentScores };
  const storyScores: Record<string, number> = {};

  for (const cat of UNIFIED_CATEGORIES) {
    if (updatedScores[cat] === undefined) {
      updatedScores[cat] = 0;
    }
  }

  const matchedKeywords: string[] = [];

  for (const word of words) {
    const category = KEYWORD_MAP[word];
    if (category) {
      updatedScores[category] += 1;
      storyScores[category] = (storyScores[category] || 0) + 1;
      matchedKeywords.push(word);
    }
  }

  console.log(`\nStory Analysis Debug:`);
  console.log(`Story:\n"${text}"`);
  console.log(`\nMatched Keywords:\n${matchedKeywords.length > 0 ? matchedKeywords.map(k => `* ${k}`).join('\n') : "* None"}`);
  
  console.log(`\nCategory Updates:`);
  for (const [cat, score] of Object.entries(updatedScores)) {
    if (score > (currentScores[cat] || 0)) {
      console.log(`* ${cat} +${score - (currentScores[cat] || 0)}`);
    }
  }

  console.log(`\nUpdated Scores:`);
  let totalScore = 0;
  for (const [cat, score] of Object.entries(updatedScores)) {
    if (score > 0) {
      console.log(`${cat} = ${score}`);
      totalScore += score;
    }
  }

  console.log(`\nFinal Percentages:`);
  for (const [cat, score] of Object.entries(updatedScores)) {
    if (score > 0) {
      const percentage = Math.round((score / totalScore) * 100);
      console.log(`${cat} = ${percentage}%`);
    }
  }
  console.log(`\n`);

  return { updatedScores, storyScores, matchedKeywords };
}

const MAX_Q_SCORES: Record<string, number> = {
  "Family Values": 20,
  "Relationship Commitment": 20,
  "Communication Style": 20,
  "Emotional Wellbeing": 20, 
  "Career Focus": 20,
  "Personal Growth": 20,
  "Social Engagement": 20,
  "Adventure & Travel": 20,
  "Health & Lifestyle": 20, 
  "Kindness & Empathy": 20
};

export function calculateUnifiedScores(
  questionnaireScores: Record<string, number>, 
  storyScores: Record<string, number>
): Record<string, number> {
  const finalScores: Record<string, number> = {};
  
  const hasStory = storyScores && Object.keys(storyScores).length > 0;
  const qWeight = hasStory ? 0.6 : 1.0;
  const sWeight = hasStory ? 0.4 : 0.0;
  
  for (const cat of UNIFIED_CATEGORIES) {
    const rawQ = questionnaireScores?.[cat] || 0;
    const rawS = storyScores?.[cat] || 0;
    
    // Normalize Q score to 0-100 based on estimated maximums
    const maxQ = MAX_Q_SCORES[cat] || 20;
      
    const normQ = Math.min(100, Math.round((rawQ / maxQ) * 100));

    // Normalize S score to 0-100 (assume 10 keywords = 100%)
    const normS = Math.min(100, rawS * 10);
    
    // Dynamically weight depending on if story data exists
    const finalVal = (normQ * qWeight) + (normS * sWeight);
    finalScores[cat] = Math.round(finalVal); // Round to integer 0-100
  }
  
  return finalScores;
}

export function convertUnifiedToLegacyTraits(unifiedScores: Record<string, number>): any[] {
  const connectionPts = unifiedScores["Connection"] ?? (
    (unifiedScores["Family Values"] || 0) + 
    (unifiedScores["Relationship Commitment"] || 0) + 
    (unifiedScores["Social Engagement"] || 0) + 
    (unifiedScores["Kindness & Empathy"] || 0)
  );

  const growthPts = unifiedScores["Growth"] ?? (
    (unifiedScores["Personal Growth"] || 0) + 
    (unifiedScores["Career Focus"] || 0)
  );

  const stabilityPts = unifiedScores["Stability"] ?? (
    (unifiedScores["Emotional Wellbeing"] || 0) + 
    (unifiedScores["Communication Style"] || 0)
  );

  const explorationPts = unifiedScores["Exploration"] ?? (
    (unifiedScores["Adventure & Travel"] || 0) + 
    (unifiedScores["Health & Lifestyle"] || 0)
  );

  const totalPts = connectionPts + growthPts + stabilityPts + explorationPts;

  let connection = 0;
  let growth = 0;
  let stability = 0;
  let exploration = 0;

  if (totalPts > 0) {
    connection = Math.round((connectionPts / totalPts) * 100);
    growth = Math.round((growthPts / totalPts) * 100);
    stability = Math.round((stabilityPts / totalPts) * 100);
    exploration = Math.round((explorationPts / totalPts) * 100);

    const currentSum = connection + growth + stability + exploration;
    if (currentSum !== 100 && currentSum > 0) {
      const diff = 100 - currentSum;
      if (connection >= growth && connection >= stability && connection >= exploration) connection += diff;
      else if (growth >= stability && growth >= exploration) growth += diff;
      else if (stability >= exploration) stability += diff;
      else exploration += diff;
    }
  }

  return [
    { trait: "Connection", score: connection },
    { trait: "Stability", score: stability },
    { trait: "Growth", score: growth },
    { trait: "Exploration", score: exploration },
    { trait: "Family Orientation", score: connection },
    { trait: "Career Focus", score: growth },
    { trait: "Communication Style", score: stability },
    { trait: "Emotional Maturity", score: stability },
    { trait: "Relationship Commitment", score: connection },
    { trait: "Adventure Seeking", score: exploration },
    { trait: "Social Engagement", score: connection },
  ];
}

const WEIGHTS: Record<string, number> = {
  "Family Values": 20,
  "Relationship Commitment": 20,
  "Communication Style": 20,
  "Emotional Wellbeing": 15,
  "Career Focus": 10,
  "Social Engagement": 5,
  "Adventure & Travel": 5,
  "Personal Growth": 5,
  "Health & Lifestyle": 0,
  "Kindness & Empathy": 0
};

export const Q_CATEGORIES = [
  "Family Values",
  "Communication Style",
  "Relationship Expectations",
  "Career Goals",
  "Lifestyle",
  "Personal Growth",
  "Social Preferences",
  "Adventure Level"
];

export const S_CATEGORIES = [
  "Family Values",
  "Career Focus",
  "Personal Growth",
  "Social Engagement",
  "Adventure & Travel",
  "Emotional Wellbeing",
  "Kindness & Empathy"
];

export function calculateCategoryMatch(scoresA: Record<string, number>, scoresB: Record<string, number>, categories: readonly string[], isStory: boolean = false) {
  if (!scoresA || !scoresB || Object.keys(scoresA).length === 0 || Object.keys(scoresB).length === 0) return 50;
  let totalScore = 0;
  let count = 0;
  for (const cat of categories) {
    let a = scoresA[cat] || 0;
    let b = scoresB[cat] || 0;
    if (a === 0 && b === 0) continue;
    if (isStory) {
       a = Math.min(100, a * 10);
       b = Math.min(100, b * 10);
    }
    totalScore += Math.max(0, 100 - Math.abs(a - b));
    count++;
  }
  return count > 0 ? Math.round(totalScore / count) : 50;
}

// Backwards compatibility: old function name used in tests
export function calculateStoryCompatibility(scoresA: Record<string, number>, scoresB: Record<string, number>) {
  // Uses unified categories for compatibility calculation without story weighting.
  return calculateCategoryMatch(scoresA, scoresB, UNIFIED_CATEGORIES, false);
}

export function calculateSoulMatchCompatibility(
  qScoresA: Record<string, number>, qScoresB: Record<string, number>,
  sScoresA: Record<string, number>, sScoresB: Record<string, number>,
  userA?: any, userB?: any,
  reflectionsA?: any[], reflectionsB?: any[],
  answersA?: any[], answersB?: any[]
) {
  // Legacy traits logic
  const getRawTraits = (qScores: Record<string, number>) => {
    const connection = (qScores["Family Values"] || 0) + (qScores["Relationship Commitment"] || 0) + (qScores["Social Engagement"] || 0) + (qScores["Kindness & Empathy"] || 0);
    const stability = (qScores["Emotional Wellbeing"] || 0) + (qScores["Communication Style"] || 0);
    const growth = (qScores["Personal Growth"] || 0) + (qScores["Career Focus"] || 0);
    const exploration = (qScores["Adventure & Travel"] || 0) + (qScores["Health & Lifestyle"] || 0);
    return { "Connection": connection, "Stability": stability, "Growth": growth, "Exploration": exploration };
  };

  const traitsA = {
    "Connection": qScoresA["Connection"] || 0,
    "Stability": qScoresA["Stability"] || 0,
    "Growth": qScoresA["Growth"] || 0,
    "Exploration": qScoresA["Exploration"] || 0,
  };

  const traitsB = {
    "Connection": qScoresB["Connection"] || 0,
    "Stability": qScoresB["Stability"] || 0,
    "Growth": qScoresB["Growth"] || 0,
    "Exploration": qScoresB["Exploration"] || 0,
  };

  const pMatch = calculateCategoryMatch(traitsA, traitsB, Object.keys(traitsA), false);

  const traitBreakdowns = Object.keys(traitsA).map(cat => {
    const a = traitsA[cat as keyof typeof traitsA];
    const b = traitsB[cat as keyof typeof traitsB];
    const diff = Math.abs(a - b);
    const similarity = Math.max(0, 100 - (diff * 2));
    const insight = similarity >= 80 ? "Highly Compatible" : similarity >= 50 ? "Balanced Difference" : "Complementary Difference";
    return { name: cat, similarity, myScore: a, theirScore: b, isStory: false, weight: 1, insight };
  });

  // --- Multi-modal Values Engine ---
  const sWeights: Record<string, number> = {
    "Family Values": 0.15,
    "Relationship Commitment": 0.10,
    "Communication Style": 0.10,
    "Emotional Wellbeing": 0.10,
    "Career Focus": 0.10,
    "Personal Growth": 0.10,
    "Social Engagement": 0.10,
    "Adventure & Travel": 0.10,
    "Health & Lifestyle": 0.10,
    "Kindness & Empathy": 0.05
  };

  const incorporateData = (cat: string, user: any, reflections?: any[], answers?: any[]) => {
    // The user requested to only compare story data. We are zeroing out the extra multi-modal data points.
    return { extraScore: 0, extraPoints: 0 };
  };

  const rawMultiA: Record<string, number> = {};
  const rawMultiB: Record<string, number> = {};
  const dataPointsA: Record<string, number> = {};
  const dataPointsB: Record<string, number> = {};

  let totalMultiA = 0;
  let totalMultiB = 0;

  for (const cat of Object.keys(sWeights)) {
    const rawStoryA = sScoresA[cat] || 0;
    const rawStoryB = sScoresB[cat] || 0;

    const dataA = incorporateData(cat, userA, reflectionsA, answersA);
    const dataB = incorporateData(cat, userB, reflectionsB, answersB);

    rawMultiA[cat] = (rawStoryA * 10) + dataA.extraScore;
    rawMultiB[cat] = (rawStoryB * 10) + dataB.extraScore;

    dataPointsA[cat] = rawStoryA + dataA.extraPoints;
    dataPointsB[cat] = rawStoryB + dataB.extraPoints;

    totalMultiA += rawMultiA[cat];
    totalMultiB += rawMultiB[cat];
  }

  let validStoryWeightSum = 0;
  let sScoreTotal = 0;
  
  const getInsight = (similarity: number, insufficientData: boolean) => {
    if (insufficientData) return "Limited Data";
    if (similarity >= 90) return "Excellent Alignment";
    if (similarity >= 75) return "Strong Compatibility";
    if (similarity >= 60) return "Moderate Difference";
    return "Significant Difference";
  };

  const getCatConfidence = (count: number) => {
    if (count >= 10) return "High Confidence";
    if (count >= 5) return "Medium Confidence";
    return "Low Confidence";
  };

  const storyBreakdowns = Object.keys(sWeights).map(cat => {
    const a = totalMultiA > 0 ? Math.round((rawMultiA[cat] / totalMultiA) * 100) : 0;
    const b = totalMultiB > 0 ? Math.round((rawMultiB[cat] / totalMultiB) * 100) : 0;
    
    const diff = Math.abs(a - b);
    let similarity = Math.max(0, Math.round(100 - (diff * 2)));
    
    const ptsA = dataPointsA[cat] || 0;
    const ptsB = dataPointsB[cat] || 0;
    let insufficientData = false;
    
    if (ptsA === 0 && ptsB === 0) {
      insufficientData = true;
      similarity = 0;
    } else {
      validStoryWeightSum += sWeights[cat];
      sScoreTotal += similarity * sWeights[cat];
    }
    
    let statusMessage = "Analysis Pending";
    if (insufficientData) {
      statusMessage = "Analysis Pending – Need more data from both users";
    }

    const qualitativeLabel = !insufficientData ? (
      similarity >= 95 ? "Excellent Match" :
      similarity >= 80 ? "Good Match" :
      similarity >= 65 ? "Moderate Match" : "Needs Better Understanding"
    ) : "";

    const insight = insufficientData ? statusMessage : getInsight(similarity, false);
    const catConfidence = getCatConfidence(ptsA);
    const catStoryCount = ptsA;
    const theirStoryCount = ptsB;
    
    return { name: cat, similarity, isStory: true, weight: sWeights[cat], myScore: a, theirScore: b, insufficientData, insight, catConfidence, catStoryCount, theirStoryCount, statusMessage, qualitativeLabel };
  });

  let sMatch = 0;
  if (validStoryWeightSum > 0) {
    sMatch = Math.round(sScoreTotal / validStoryWeightSum);
  }

  let minPtsTotal = 0;
  for (const cat of Object.keys(sWeights)) {
    minPtsTotal += Math.min(dataPointsA[cat] || 0, dataPointsB[cat] || 0);
  }

  let sConfidenceString = "Low";
  if (minPtsTotal >= 20) sConfidenceString = "High";
  else if (minPtsTotal >= 10) sConfidenceString = "Medium";
  
  const sConfidenceData = {
    level: sConfidenceString,
    stories: minPtsTotal,
    categoriesAnalyzed: storyBreakdowns.filter(c => !c.insufficientData).length,
    totalCategories: Object.keys(sWeights).length
  };

  console.log(`Overall Values Match: ${sMatch}% (Confidence: ${sConfidenceString}, Data Points: ${minPtsTotal})`);
  console.log(sConfidenceData);

  // Overall Compatibility Calculation
  // 60% Personality, 40% Story & Values
  let components = 0;
  let finalScore = 0;
  
  if (pMatch > 0) {
    components += 0.6;
    finalScore += pMatch * 0.6;
  }
  
  if (sMatch > 0) {
    components += 0.4;
    finalScore += sMatch * 0.4;
  }

  finalScore = components > 0 ? Math.round(finalScore / components) : 0;

  // Cap at 99% unless identical
  if (finalScore === 100 && (pMatch < 99 || sMatch < 99)) {
     finalScore = 99;
  }

  // Generate dynamic insights
  const allBreakdowns = [...traitBreakdowns, ...storyBreakdowns];
  allBreakdowns.sort((a, b) => b.similarity - a.similarity);

  const whyYouMatch = allBreakdowns
    .filter(b => b.similarity >= 70)
    .slice(0, 4)
    .map(b => `✔ Similar ${b.name}`);

  if (whyYouMatch.length === 0) {
    whyYouMatch.push("✔ Similar Balance");
  }

  const areasToExplore = allBreakdowns
    .filter(b => b.similarity < 70)
    .sort((a, b) => a.similarity - b.similarity)
    .slice(0, 3)
    .map(b => `⚠ ${b.name}`);

  const topMatchNames = allBreakdowns.slice(0, 3).map(b => b.name.toLowerCase());
  const differenceNames = areasToExplore.map(item => item.replace('⚠ ', '').toLowerCase());
  let aiSummary = `Your compatibility is primarily driven by strong ${topMatchNames.join(', ')} patterns.`;
  if (differenceNames.length > 0) {
    aiSummary += ` Differences appear in ${differenceNames.join(' and ')}, giving both of you opportunities to complement each other.`;
  }

  const getPConfidence = (rawScore: number) => {
    if (rawScore < 5) return "Low Confidence";
    if (rawScore < 15) return "Medium Confidence";
    return "High Confidence";
  };
  const totalTraitsA = Object.values(traitsA).reduce((acc, val) => acc + val, 0);
  const totalTraitsB = Object.values(traitsB).reduce((acc, val) => acc + val, 0);
  const pConfidence = getPConfidence(Math.min(totalTraitsA, totalTraitsB));

  const hasStories = validStoryWeightSum > 0;

  return { pMatch, sMatch, finalScore, hasStories, traitBreakdowns, storyBreakdowns, whyYouMatch, areasToExplore, aiSummary, pConfidence, sConfidenceData };
}

// Keep export for backwards compatibility in other parts of the app if needed
export function calculateHybridCompatibility(
  qScoresA: Record<string, number>, qScoresB: Record<string, number>,
  sScoresA: Record<string, number>, sScoresB: Record<string, number>,
  userA?: any, userB?: any,
  reflectionsA?: any[], reflectionsB?: any[],
  answersA?: any[], answersB?: any[]
) {
  const result = calculateSoulMatchCompatibility(qScoresA, qScoresB, sScoresA, sScoresB, userA, userB, reflectionsA, reflectionsB, answersA, answersB);
  return { qMatch: result.pMatch, sMatch: result.sMatch, finalScore: result.finalScore, hasStories: result.hasStories };
}

export function calculateWeightedCompatibility(scoresA: Record<string, number>, scoresB: Record<string, number>): number {
  if (!scoresA || !scoresB || Object.keys(scoresA).length === 0 || Object.keys(scoresB).length === 0) {
    return 50; 
  }

  let totalScore = 0;
  let totalWeight = 0;

  for (const cat of Object.keys(WEIGHTS)) {
    const weight = WEIGHTS[cat];
    if (weight === 0) continue;

    const a = scoresA[cat] || 0;
    const b = scoresB[cat] || 0;
    
    if (a === 0 && b === 0) continue;

    // Category Match = 100 - ABS(UserA - UserB)
    const categoryMatch = Math.max(0, 100 - Math.abs(a - b));
    
    totalScore += categoryMatch * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 50;

  return Math.round(totalScore / totalWeight);
}

export function generateProfileInsights(scores: Record<string, number>): string {
  if (!scores || Object.keys(scores).length === 0) return "What Matters Most To This Person\n\nPost stories to see insights!";

  const sortedCategories = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter((entry) => entry[1] > 0);

  if (sortedCategories.length === 0) return "What Matters Most To This Person\n\nPost stories to see insights!";

  const topCats = sortedCategories.slice(0, 5).map((c) => c[0]);
  
  const iconMap: Record<string, string> = {
    "Family Values": "❤️",
    "Relationship Commitment": "💕",
    "Communication Style": "💬",
    "Emotional Wellbeing": "🧠",
    "Career Focus": "💼",
    "Personal Growth": "🌱",
    "Social Engagement": "👥",
    "Adventure & Travel": "✈️",
    "Health & Lifestyle": "🍏",
    "Kindness & Empathy": "🤝",
  };

  let insightString = "What Matters Most To This Person\n\n";
  for (const cat of topCats) {
     insightString += `${iconMap[cat]} ${cat}\n`;
  }

  return insightString.trim();
}

export function generateDeterministicConversationStarters(scoresA: Record<string, number>, scoresB: Record<string, number>): string[] {
  const starters: string[] = [];
  if (!scoresA || !scoresB) return ["What was the best part of your week?"];

  const sortedA = Object.entries(scoresA).sort((a, b) => b[1] - a[1]).filter(x => x[1] > 0);
  const sortedB = Object.entries(scoresB).sort((a, b) => b[1] - a[1]).filter(x => x[1] > 0);
  
  const topA = sortedA.slice(0, 3).map(x => x[0]);
  const topB = sortedB.slice(0, 3).map(x => x[0]);
  const shared = topA.filter(c => topB.includes(c));

  if (shared.includes("Adventure & Travel")) starters.push("I see we both love to travel. What's the wildest trip you've ever been on?");
  if (shared.includes("Personal Growth")) starters.push("We're both into learning new things. What's the last great book you read?");
  if (shared.includes("Career Focus")) starters.push("We're both very ambitious. What is your ultimate career goal?");
  if (shared.includes("Social Engagement")) starters.push("You seem as outgoing as I am! What's your ideal weekend plan?");
  if (shared.includes("Family Values")) starters.push("We both seem to value family highly. Do you have a large extended family?");
  if (shared.includes("Kindness & Empathy")) starters.push("It's great to connect with someone who also values giving back. Have you volunteered recently?");
  
  if (starters.length === 0) {
    if (topA[0] && topB[0]) {
       starters.push(`I see you strongly value ${topB[0].toLowerCase()}. Tell me more about that!`);
    } else {
       starters.push("What's a hobby you've always wanted to pick up?");
    }
  }
  return starters.slice(0, 3);
}

export function generateDeterministicMatchInsights(
  scoresA: Record<string, number>, 
  scoresB: Record<string, number>,
  storyScoresA: Record<string, number> = {},
  storyScoresB: Record<string, number> = {},
  qMatch: number = 50,
  sMatch: number = 50,
  finalScore: number = 50,
  hasStories: boolean = false
): any {
  if (!scoresA || !scoresB) {
      return {
          whyYouMatch: ["You have complementary personality profiles."],
          sharedStrengths: ["Balanced traits"],
          potentialDifferences: ["Minor differences"],
          communicationSuggestions: ["Be open and honest"]
      };
  }
  
  // Calculate Differences for Shared Strengths and Potential Differences
  const sharedStrengths: string[] = [];
  const potentialDifferences: string[] = [];

  console.log("\n--- Debug: Compatibility Differences ---");
  console.log("Questionnaire Differences:");

  const qGaps = [];
  for (const cat of Q_CATEGORIES) {
    const a = scoresA[cat] || 0;
    const b = scoresB[cat] || 0;
    const diff = Math.abs(a - b);
    qGaps.push({ cat, diff, a, b });
    console.log(`* ${cat} gap = ${diff}`);
  }

  console.log("Story Differences:");
  const sGaps = [];
  for (const cat of S_CATEGORIES) {
    const a = storyScoresA[cat] || 0;
    const b = storyScoresB[cat] || 0;
    const diff = Math.abs(a - b);
    sGaps.push({ cat, diff, a, b });
    console.log(`* ${cat} gap = ${diff}`);
  }
  console.log("----------------------------------------\\n");

  qGaps.sort((a, b) => b.diff - a.diff);
  sGaps.sort((a, b) => b.diff - a.diff);

  for (const gap of qGaps) {
    if (gap.diff <= 15 && gap.a > 0 && gap.b > 0) {
      sharedStrengths.push(`✓ Similar ${gap.cat}`);
    }
  }

  for (const gap of sGaps) {
    if (gap.diff <= 15 && gap.a > 0 && gap.b > 0 && !sharedStrengths.includes(`✓ Similar ${gap.cat}`)) {
      sharedStrengths.push(`✓ Similar ${gap.cat}`);
    }
  }

  for (const gap of qGaps) {
    if (gap.diff >= 30) {
      potentialDifferences.push(`⚠ Different ${gap.cat}`);
    }
  }

  for (const gap of sGaps) {
    if (gap.diff >= 30 && !potentialDifferences.includes(`⚠ Different ${gap.cat}`)) {
      potentialDifferences.push(`⚠ Different ${gap.cat}`);
    }
  }

  if (Object.keys(scoresA).length === 0 || Object.keys(scoresB).length === 0) {
    potentialDifferences.push("⚠ Need more questions answered");
  } else if (qMatch < 70 && potentialDifferences.length === 0) {
    const largestQ = qGaps[0];
    const largestS = sGaps[0];
    if (largestQ && largestQ.diff > 0) potentialDifferences.push(`⚠ Different ${largestQ.cat}`);
    if (largestS && largestS.diff > 0 && largestS.cat !== largestQ?.cat) potentialDifferences.push(`⚠ Different ${largestS.cat}`);
  }

  if (sharedStrengths.length === 0) sharedStrengths.push("✓ Balanced overall traits");
  
  if (qMatch >= 85 && sMatch >= 85) {
     potentialDifferences.length = 0; 
     potentialDifferences.push("✓ No major differences");
  } else if (potentialDifferences.length === 0) {
     potentialDifferences.push("⚠ Differing overall priorities");
  }

  return {
    whyYouMatch: sharedStrengths,
    sharedStrengths: sharedStrengths.slice(0, 4),
    potentialDifferences: potentialDifferences.slice(0, 3),
    communicationSuggestions: ["Ask open-ended questions about their experiences", "Embrace your different perspectives"],
    behavioralComparison: [],
    potentialDifferencesBehavioral: [],
    compatibilityBreakdownObj: {
      personalityMatch: qMatch,
      aiStoryMatch: sMatch,
      compatibilityScore: finalScore,
      behavioralMatch: finalScore, // fallback
      hasStories
    }
  };
}

export function generateCumulativeProfile(scores: Record<string, number>, journals: {content: string}[]): any {
  if (!scores || Object.keys(scores).length === 0) return null;

  let totalScore = 0;
  for (const score of Object.values(scores)) {
    totalScore += score;
  }

  if (totalScore === 0) return null;

  const usedJournals = new Set<string>();

  const percentages = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, score]) => {
      let evidence = "";
      const reversedJournals = [...(journals || [])].reverse();
      for (const j of reversedJournals) {
        if (!j.content) continue;
        if (usedJournals.has(j.content)) continue;
        const jScores = analyzeStoryKeywords(j.content);
        if ((jScores.storyScores?.[cat] || 0) > 0) {
          evidence = j.content.length > 50 ? `${j.content.substring(0, 50)}...` : j.content;
          usedJournals.add(j.content);
          break;
        }
      }

      return {
        category: cat,
        percentage: Math.round((score / totalScore) * 100),
        score: score,
        evidence: evidence
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    percentages,
    summary: `Your stories reflect a strong focus on ${percentages.slice(0, 3).map(p => p.category).join(", ")}.`
  };
}

function matchCategoryList(
  scoresA: Record<string, number>,
  scoresB: Record<string, number>,
  categories: string[]
): number | null {
  if (!scoresA || !scoresB) return null;
  let totalScore = 0;
  let count = 0;
  for (const cat of categories) {
    const a = scoresA[cat] ?? 0;
    const b = scoresB[cat] ?? 0;
    // Skip pairs where BOTH are zero — no data available, not a perfect match
    if (a === 0 && b === 0) continue;
    totalScore += Math.max(0, 100 - Math.abs(a - b));
    count++;
  }
  // If no countable pairs found, return null to signal absence of data
  return count > 0 ? Math.round(totalScore / count) : null;
}

export function calculateDetailedInsights(
  unifiedScoresA: Record<string, number>,
  unifiedScoresB: Record<string, number>,
  hybridFallbackScore?: number
) {
  const valueAlignment = matchCategoryList(unifiedScoresA, unifiedScoresB, [
    "Family Values", "Personal Growth", "Relationship Commitment", "Career Focus"
  ]);

  const communicationMatch = matchCategoryList(unifiedScoresA, unifiedScoresB, [
    "Communication Style", "Emotional Wellbeing"
  ]);

  const emotionalCompatibility = matchCategoryList(unifiedScoresA, unifiedScoresB, [
    "Kindness & Empathy", "Emotional Wellbeing", "Relationship Commitment"
  ]);

  let totalScore = 0;
  let totalWeight = 0;

  if (valueAlignment !== null)       { totalScore += valueAlignment * 0.40;       totalWeight += 0.40; }
  if (communicationMatch !== null)   { totalScore += communicationMatch * 0.30;   totalWeight += 0.30; }
  if (emotionalCompatibility !== null){ totalScore += emotionalCompatibility * 0.30; totalWeight += 0.30; }

  let overallCompatibility: number | null;

  if (totalWeight > 0) {
    overallCompatibility = Math.round(totalScore / totalWeight);
  } else if (hybridFallbackScore !== undefined) {
    // Both profiles have no meaningful unified data; use hybrid Q+S score as best estimate.
    // Cap at 85 to prevent false 100% matches when no real data exists.
    overallCompatibility = Math.min(85, hybridFallbackScore);
  } else {
    overallCompatibility = null;
  }

  return {
    valueAlignment,
    communicationMatch,
    emotionalCompatibility,
    overallCompatibility,
  };
}

/**
 * Extracts interest categories from a list of story texts.
 * Returns a de-duplicated, human-readable label for each category
 * that appeared at least once across the user's stories.
 */
export function extractStoryInterests(storyTexts: string[]): string[] {
  // Human-readable labels for each UNIFIED_CATEGORY
  const categoryLabels: Record<string, string> = {
    "Family Values":            "Family & Relationships",
    "Career Focus":             "Career & Ambition",
    "Personal Growth":          "Learning & Self-Improvement",
    "Health & Lifestyle":       "Health & Fitness",
    "Adventure & Travel":       "Travel & Adventure",
    "Social Engagement":        "Social Life",
    "Kindness & Empathy":       "Kindness & Community",
    "Emotional Wellbeing":      "Mindfulness & Wellness",
    "Relationship Commitment":  "Serious Relationships",
    "Communication Style":      "Open Communication",
  };

  const foundCategories = new Set<string>();

  for (const text of storyTexts) {
    const words = text.toLowerCase().replace(/[.,/#!$%^*;:{}=\-_`~()]/g, "").split(/\s+/);
    // Also try two-word and three-word phrases for multi-word keys
    const bigrams = words.map((w, i) => words[i + 1] ? `${w} ${words[i + 1]}` : "");
    const trigrams = words.map((w, i) => words[i + 1] && words[i + 2] ? `${w} ${words[i + 1]} ${words[i + 2]}` : "");

    for (const token of [...words, ...bigrams, ...trigrams]) {
      if (!token) continue;
      const cat = KEYWORD_MAP[token];
      if (cat) foundCategories.add(cat);
    }
  }

  return Array.from(foundCategories).map(cat => categoryLabels[cat] ?? cat);
}