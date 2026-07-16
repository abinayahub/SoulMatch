// @ts-nocheck
import { analyzeStoryKeywords, generateProfileInsights } from "./services/keywordAnalysis";

function runTest() {
  let scores: Record<string, number> = {};

  // Test 1
  const t1 = "I went on a trip with my friends";
  scores = analyzeStoryKeywords(t1, scores);
  console.log("After Test 1:", t1);
  console.log("Scores:", scores);

  // Test 2
  const t2 = "I spent time with my grandparents";
  scores = analyzeStoryKeywords(t2, scores);
  console.log("After Test 2:", t2);
  console.log("Scores:", scores);

  // Additional stories
  scores = analyzeStoryKeywords("We had a great family dinner.", scores);
  scores = analyzeStoryKeywords("Reading a book about science.", scores);
  scores = analyzeStoryKeywords("I love painting and art.", scores);

  console.log("After 5 stories, Final Scores:", scores);
  console.log("Insights:", generateProfileInsights(scores));
}

runTest();
// @ts-nocheck
