// Matching Algorithm Implementation based on SoulMatch AI Logic

// Step 1: Define Categories
type CategoryScores = {
  connection: number;  // Max 100%
  growth: number;      // Max 100%
  stability: number;   // Max 100%
  exploration: number; // Max 100%
};

// Represents a user's calculated profile traits
type UserProfile = {
  id: string;
  name: string;
  scores: CategoryScores;
};

/**
 * Compare two users and calculate the final compatibility score
 * using the master traits.
 */
export function calculateCompatibility(userA: any, userB: any) {
  // 1. Personality Match (50%)
  const connectionMatch = 100 - Math.abs(userA.scores.connection - userB.scores.connection);
  const growthMatch = 100 - Math.abs(userA.scores.growth - userB.scores.growth);
  const stabilityMatch = 100 - Math.abs(userA.scores.stability - userB.scores.stability);
  const explorationMatch = 100 - Math.abs(userA.scores.exploration - userB.scores.exploration);
  const personalityScore = (connectionMatch + growthMatch + stabilityMatch + explorationMatch) / 4;

  // 2. Behavioral Match (30%)
  // For the sake of the test, assume it averages to a certain score
  const behavioralScore = 100 - Math.abs((userA.behavioralScore || 50) - (userB.behavioralScore || 50));

  // 3. AI Story Match (20%)
  const aiStoryScore = 100 - Math.abs((userA.aiStoryScore || 50) - (userB.aiStoryScore || 50));

  // Apply the Weighted Matching Formula (50/30/20)
  const weightedScore = (
    (personalityScore * 0.50) +
    (behavioralScore * 0.30) +
    (aiStoryScore * 0.20)
  );

  return {
    overallCompatibility: Math.round(weightedScore),
    breakdown: {
      personalityScore,
      behavioralScore,
      aiStoryScore
    }
  };
}

// --- TEST THE ALGORITHM ---

// Example User A
const userA: UserProfile = {
  id: "1",
  name: "Ananya",
  scores: {
    connection: 32, // e.g. 32%
    growth: 29,     // e.g. 29%
    stability: 22,  // e.g. 22%
    exploration: 17 // e.g. 17%
  }
};

// Example User B
const userB: UserProfile = {
  id: "2",
  name: "Priya",
  scores: {
    connection: 30, // e.g. 30%
    growth: 25,     // e.g. 25%
    stability: 20,  // e.g. 20%
    exploration: 25 // e.g. 25%
  }
};

// Run the calculation
const result = calculateCompatibility(userA, userB);

console.log(`Comparing ${userA.name} and ${userB.name}:`);
console.log(`Overall Compatibility: ${result.overallCompatibility}%`);
console.log("Category Breakdown:");
console.log(`- Personality Match: ${result.breakdown.personalityScore}%`);
console.log(`- Behavioral Match: ${result.breakdown.behavioralScore}%`);
console.log(`- AI Story Match: ${result.breakdown.aiStoryScore}%`);
