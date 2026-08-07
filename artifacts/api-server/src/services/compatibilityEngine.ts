import { compatibilityConfig } from "../config/compatibilityConfig";

export interface CompatibilityInput {
  journeyScore: number;
  journeyCount: number;
  storyScore: number;
  storyCount: number;
  communityScore: number;
  communityCount: number;
}

export function calculateFinalCompatibility(input: CompatibilityInput): any {
  const { journey, story, community, confidenceLimits } = compatibilityConfig;

  // 0. Minimum Data Validation
  if (
    input.journeyCount < journey.minimumDataThreshold ||
    input.storyCount < story.minimumDataThreshold ||
    input.communityCount < community.minimumDataThreshold
  ) {
    return {
      displayedCompatibility: "Insufficient Data",
      analysisStatus: "Insufficient Data",
      nextMilestone: "Please answer more Journey questions, Stories, and Community questions to unlock compatibility insights."
    };
  }

  // 1. Calculate Individual Confidences
  const journeyConfidence = Math.min(100, (input.journeyCount / journey.totalQuestions) * 100);
  const storyConfidence = Math.min(100, (input.storyCount / story.minimumReliableStories) * 100);
  const communityConfidence = Math.min(100, (input.communityCount / community.minimumReliableAnswers) * 100);

  // 2. Calculate Overall Scores
  const overallSimilarity = 
    (input.journeyScore * journey.weight) + 
    (input.storyScore * story.weight) + 
    (input.communityScore * community.weight);

  const overallConfidence = 
    (journeyConfidence * journey.weight) + 
    (storyConfidence * story.weight) + 
    (communityConfidence * community.weight);

  // 3. Determine Maximum Displayed Compatibility Based on Confidence (Linear Interpolation)
  let maxAllowed = confidenceLimits[confidenceLimits.length - 1].maxDisplayed;
  for (let i = 0; i < confidenceLimits.length - 1; i++) {
    const current = confidenceLimits[i];
    const next = confidenceLimits[i + 1];
    
    if (overallConfidence >= current.maxConfidence && overallConfidence <= next.maxConfidence) {
      // Avoid division by zero
      const rangeConfidence = next.maxConfidence - current.maxConfidence;
      if (rangeConfidence === 0) {
        maxAllowed = current.maxDisplayed;
        break;
      }

      const rangeDisplayed = next.maxDisplayed - current.maxDisplayed;
      const fraction = (overallConfidence - current.maxConfidence) / rangeConfidence;
      maxAllowed = current.maxDisplayed + (fraction * rangeDisplayed);
      break;
    }
  }

  // 4. Calculate Final Displayed Compatibility
  const displayedCompatibility = Math.min(overallSimilarity, maxAllowed);

  // 5. Determine Text Outputs
  let matchReliability = "Very Low";
  if (overallConfidence >= 76) matchReliability = "High";
  else if (overallConfidence >= 51) matchReliability = "Medium";
  else if (overallConfidence >= 26) matchReliability = "Low";

  let nextMilestone = "";
  let analysisStatus = "Learning";

  if (overallConfidence < 51) {
    nextMilestone = "Complete more Journey questions and share more Stories to unlock more accurate compatibility.";
  } else if (overallConfidence < 76) {
    nextMilestone = "Keep answering Community questions and adding Stories to reach maximum match reliability.";
  } else {
    nextMilestone = "You have provided enough data for highly reliable matching.";
    analysisStatus = "Complete";
  }

  return {
    journeySimilarity: Math.round(input.journeyScore),
    storySimilarity: Math.round(input.storyScore),
    communitySimilarity: Math.round(input.communityScore),
    overallSimilarity: Math.round(overallSimilarity),
    
    journeyConfidence: Math.round(journeyConfidence),
    storyConfidence: Math.round(storyConfidence),
    communityConfidence: Math.round(communityConfidence),
    overallConfidence: Math.round(overallConfidence),
    
    displayedCompatibility: Math.round(displayedCompatibility),
    
    matchReliability,
    nextMilestone,
    analysisStatus
  };
}
