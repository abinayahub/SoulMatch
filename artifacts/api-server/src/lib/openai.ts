import OpenAI from 'openai';

// Initialize the OpenAI client using the API key from environment variables
// Ensure OPENAI_API_KEY is set in your .env file
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * 1. AI Story Analysis
 */
export async function analyzeStory(storyText: string) {
  const prompt = `You are a personality and behavior analysis assistant.

Analyze the user's story.

Return JSON only.

Identify:
1. Current Mood
2. Emotional State
3. Family Orientation (Low/Medium/High)
4. Social Engagement (Low/Medium/High)
5. Personal Growth Focus (Low/Medium/High)
6. Relationship Readiness (Low/Medium/High)
7. Top 5 Personality Traits
8. Short Summary (maximum 50 words)

Story:
${storyText}

JSON Format:
{
  "mood": "",
  "emotionalState": "",
  "familyOrientation": "",
  "socialEngagement": "",
  "personalGrowth": "",
  "relationshipReadiness": "",
  "traits": [],
  "summary": ""
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // or gpt-3.5-turbo
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * 2. AI Daily Insight
 */
export async function generateDailyInsight(storyText: string) {
  const prompt = `Analyze the story and generate one positive insight about the user's behavior, values, or mindset.

Requirements:
- Maximum 40 words
- Positive tone
- No assumptions
- Focus only on information available in the story

Story:
${storyText}

Return JSON:
{
  "dailyInsight": ""
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * 3. AI Weekly Reflection
 */
export async function generateWeeklyReflection(storiesText: string) {
  const prompt = `Analyze all stories from the past 7 days.

Identify:
- Most common themes
- Emotional patterns
- Behavioral strengths
- Areas of personal growth

Return JSON:
{
  "topThemes": [],
  "dominantMood": "",
  "strengths": [],
  "growthAreas": [],
  "weeklyReflection": ""
}

Stories:
${storiesText}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * 4. AI Profile Bio Generator
 */
export async function generateProfileBio(storiesText: string) {
  const prompt = `Generate a short dating profile bio based only on the user's stories.

Requirements:
- Professional
- Authentic
- Friendly
- Maximum 80 words
- No exaggeration

Stories:
${storiesText}

Return JSON:
{
  "bio": ""
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * 5. AI Match Explanation
 */
export async function generateMatchExplanation(userASummary: string, userBSummary: string) {
  const prompt = `Compare the two users' story summaries.

Explain why they may connect well.

Focus on:
- Shared values
- Lifestyle similarities
- Relationship mindset
- Communication tendencies

Return JSON:
{
  "compatibilitySummary": "",
  "sharedValues": [],
  "sharedInterests": []
}

User A:
${userASummary}

User B:
${userBSummary}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * 6. AI Conversation Starter
 */
export async function generateConversationStarters(storiesText: string) {
  const prompt = `Based on the user's stories, generate 5 personalized conversation starters.

Requirements:
- Natural
- Friendly
- Relationship-focused
- Open-ended questions

Stories:
${storiesText}

Return JSON:
{
  "conversationStarters": [
    "",
    "",
    "",
    "",
    ""
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * 7. AI Green Flag Detection
 */
export async function detectGreenFlags(storyText: string) {
  const prompt = `Analyze the story.

Identify positive behavioral indicators.

Possible categories:
- Kindness
- Empathy
- Responsibility
- Family Orientation
- Personal Growth
- Community Support
- Emotional Maturity

Return JSON:
{
  "greenFlags": [],
  "scorePercentage": 0 // Must be a number between 0 and 100
}

Story:
${storyText}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * 8. AI Relationship Readiness
 */
export async function evaluateRelationshipReadiness(storiesText: string) {
  const prompt = `Analyze the user's stories.

Evaluate the following categories with a percentage score from 0 to 100:
- Emotional Availability
- Communication Maturity
- Stability
- Personal Growth
- Relationship Readiness

Return JSON:
{
  "emotionalAvailabilityPercentage": 0,
  "communicationMaturityPercentage": 0,
  "stabilityPercentage": 0,
  "personalGrowthPercentage": 0,
  "relationshipReadinessPercentage": 0,
  "summary": ""
}

Stories:
${storiesText}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
