import { calculateSoulMatchCompatibility } from "./src/services/keywordAnalysis.ts";

const sScoresA = {"Family Values":1,"Relationship Commitment":1,"Communication Style":0,"Emotional Wellbeing":2,"Career Focus":0,"Personal Growth":0,"Social Engagement":1,"Adventure & Travel":1,"Health & Lifestyle":1,"Kindness & Empathy":0};
const sScoresB = {"Family Values":4,"Relationship Commitment":0,"Communication Style":0,"Emotional Wellbeing":0,"Career Focus":8,"Personal Growth":11,"Social Engagement":0,"Adventure & Travel":0,"Health & Lifestyle":8,"Kindness & Empathy":2};

const result = calculateSoulMatchCompatibility({}, {}, sScoresA, sScoresB);
console.log(result.sConfidenceData);
