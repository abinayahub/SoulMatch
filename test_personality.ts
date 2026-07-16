import { analyzeStoryKeywords, calculateUnifiedScores, generateCumulativeProfile } from './artifacts/api-server/src/services/keywordAnalysis.js';

const text = "I love spending time with my family and parents. My career is also very important, I have a big project and a presentation at work.";
const result = analyzeStoryKeywords(text);
console.log("Story Analysis:", result.storyScores);

const unified = calculateUnifiedScores({}, result.storyScores);
console.log("Unified Scores:", unified);

const cumulative = generateCumulativeProfile(unified, [{content: text}]);
console.log("Cumulative:", JSON.stringify(cumulative, null, 2));
