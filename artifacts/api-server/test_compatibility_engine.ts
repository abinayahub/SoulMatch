import { calculateFinalCompatibility } from "./src/services/compatibilityEngine";

console.log("=== COMPATIBILITY ENGINE TESTS ===\n");

// Test A: Low Journey, Low Story, Low Community
console.log("--- User A (Low Confidence) ---");
const resultA = calculateFinalCompatibility({
  journeyScore: 95,
  journeyCount: 5,
  storyScore: 90,
  storyCount: 1,
  communityScore: 92,
  communityCount: 1
});
console.log(JSON.stringify(resultA, null, 2));

// Test B: Medium Confidence
console.log("\n--- User B (Medium Confidence) ---");
const resultB = calculateFinalCompatibility({
  journeyScore: 86,
  journeyCount: 80,
  storyScore: 86,
  storyCount: 8,
  communityScore: 86,
  communityCount: 7
});
console.log(JSON.stringify(resultB, null, 2));

// Test C: High Confidence
console.log("\n--- User C (High Confidence) ---");
const resultC = calculateFinalCompatibility({
  journeyScore: 89,
  journeyCount: 150,
  storyScore: 89,
  storyCount: 15,
  communityScore: 89,
  communityCount: 20
});
console.log(JSON.stringify(resultC, null, 2));

// Test D: Insufficient Data
console.log("\n--- User D (Insufficient Data) ---");
const resultD = calculateFinalCompatibility({
  journeyScore: 89,
  journeyCount: 2, // below threshold of 5
  storyScore: 89,
  storyCount: 15,
  communityScore: 89,
  communityCount: 20
});
console.log(JSON.stringify(resultD, null, 2));
