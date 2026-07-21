function convertUnifiedToLegacyTraits(unifiedScores) {
  const connectionPts = (unifiedScores["Family Values"] || 0) + 
                        (unifiedScores["Relationship Commitment"] || 0) + 
                        (unifiedScores["Social Engagement"] || 0) + 
                        (unifiedScores["Kindness & Empathy"] || 0);

  const stabilityPts = (unifiedScores["Emotional Wellbeing"] || 0) + 
                        (unifiedScores["Communication Style"] || 0);

  const growthPts = (unifiedScores["Personal Growth"] || 0) + 
                    (unifiedScores["Career Focus"] || 0);

  const explorationPts = (unifiedScores["Adventure & Travel"] || 0) + 
                         (unifiedScores["Health & Lifestyle"] || 0);

  const totalPts = connectionPts + stabilityPts + growthPts + explorationPts;

  let connection = 0;
  let stability = 0;
  let growth = 0;
  let exploration = 0;

  if (totalPts > 0) {
    connection = Math.round((connectionPts / totalPts) * 100);
    stability = Math.round((stabilityPts / totalPts) * 100);
    growth = Math.round((growthPts / totalPts) * 100);
    exploration = Math.round((explorationPts / totalPts) * 100);

    const currentSum = connection + stability + growth + exploration;
    if (currentSum !== 100 && currentSum > 0) {
      const diff = 100 - currentSum;
      if (stability >= connection && stability >= growth && stability >= exploration) stability += diff;
      else if (connection >= growth && connection >= exploration) connection += diff;
      else if (growth >= exploration) growth += diff;
      else exploration += diff;
    }
  }

  return [
    { trait: "Connection", score: connection },
    { trait: "Stability", score: stability },
    { trait: "Growth", score: growth },
    { trait: "Exploration", score: exploration }
  ];
}

// 5 Option C answers -> Emotional Wellbeing +15, Communication Style +10
const unifiedScores = {
  "Emotional Wellbeing": 15,
  "Communication Style": 10
};

const legacyTraits = convertUnifiedToLegacyTraits(unifiedScores);

console.log("========================================");
console.log("=== PERSONALITY CALCULATION DEBUG ===");
console.log("Question 1 → Option C → Stability +5");
console.log("Question 2 → Option C → Stability +5");
console.log("Question 3 → Option C → Stability +5");
console.log("Question 4 → Option C → Stability +5");
console.log("Question 5 → Option C → Stability +5");

console.log("\nRaw Trait Scores:");
console.log("Connection = 0");
console.log("Stability = 25");
console.log("Growth = 0");
console.log("Exploration = 0");

const connection = legacyTraits.find(t => t.trait === "Connection")?.score;
const stability = legacyTraits.find(t => t.trait === "Stability")?.score;
const growth = legacyTraits.find(t => t.trait === "Growth")?.score;
const exploration = legacyTraits.find(t => t.trait === "Exploration")?.score;
const overall = Math.max(connection, stability, growth, exploration);

console.log("\nFinal Percentages:");
console.log(`Connection = ${connection}%`);
console.log(`Stability = ${stability}%`);
console.log(`Growth = ${growth}%`);
console.log(`Exploration = ${exploration}%`);
console.log(`Overall = ${overall}%`);
console.log("========================================");
