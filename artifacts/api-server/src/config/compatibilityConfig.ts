export const compatibilityConfig = {
  journey: {
    totalQuestions: 150,
    minimumDataThreshold: 5,
    weight: 0.40
  },
  story: {
    minimumReliableStories: 15,
    minimumDataThreshold: 1,
    weight: 0.30
  },
  community: {
    minimumReliableAnswers: 15,
    minimumDataThreshold: 1,
    weight: 0.30
  },
  confidenceLimits: [
    { maxConfidence: 0, maxDisplayed: 25 },
    { maxConfidence: 10, maxDisplayed: 25 },
    { maxConfidence: 25, maxDisplayed: 40 },
    { maxConfidence: 50, maxDisplayed: 60 },
    { maxConfidence: 75, maxDisplayed: 80 },
    { maxConfidence: 100, maxDisplayed: 100 }
  ]
};
