
import { analyzeCommunityAnswer } from './artifacts/api-server/src/services/communityAnalysisService.ts';

async function runTest() {
  try {
    const result = await analyzeCommunityAnswer(
      "When I'm feeling stressed, how would you support me?",
      "I would first listen to you, understand your feelings, and support you until you feel better."
    );
    console.log(result);
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

runTest();
