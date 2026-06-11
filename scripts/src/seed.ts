import { db } from "@workspace/db";
import {
  usersTable, journeyQuestionsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const JOURNEY_QUESTIONS = [
  { day: 1, category: "Values", question: "What three values guide your most important decisions in life?", questionType: "text" as const },
  { day: 1, category: "Values", question: "How important is religion or spirituality in your daily life?", questionType: "choice" as const, options: ["Central to everything I do", "Important but not dominant", "Somewhat important", "Not very important", "Not important at all"] },
  { day: 2, category: "Family", question: "Describe your ideal family dynamic after marriage.", questionType: "text" as const },
  { day: 2, category: "Family", question: "How do you feel about living with extended family?", questionType: "choice" as const, options: ["Very open to it", "Open if needed", "Prefer separate but nearby", "Strongly prefer independence", "Not comfortable with it"] },
  { day: 3, category: "Career", question: "Where do you see yourself professionally in 5 years?", questionType: "text" as const },
  { day: 3, category: "Career", question: "How would you balance career ambitions with family responsibilities?", questionType: "choice" as const, options: ["Family always comes first", "Career is primary but family matters", "Equal balance", "Career-focused early, family later", "Still figuring it out"] },
  { day: 4, category: "Lifestyle", question: "Rate how important fitness and physical health is to you (1-10).", questionType: "scale" as const },
  { day: 4, category: "Lifestyle", question: "What does your ideal weekend look like?", questionType: "multi_choice" as const, options: ["Outdoor adventures", "Cozy at home", "Socializing with friends", "Cultural events", "Travel", "Reading/learning", "Religious activities", "Family time"] },
  { day: 5, category: "Communication", question: "How do you typically handle conflict in relationships?", questionType: "choice" as const, options: ["Address it immediately", "Give it time, then talk", "Prefer written communication first", "Avoid conflict when possible", "Seek mediation"] },
  { day: 5, category: "Communication", question: "What does open communication mean to you in a relationship?", questionType: "text" as const },
  { day: 6, category: "Finance", question: "How do you approach financial decisions as a couple?", questionType: "choice" as const, options: ["Joint accounts, full transparency", "Separate accounts, shared expenses", "One partner manages, other approves major decisions", "Completely separate finances", "Still figuring this out"] },
  { day: 6, category: "Finance", question: "Rate how financially secure you feel in life right now (1-10).", questionType: "scale" as const },
  { day: 7, category: "Traditions", question: "Which cultural or religious traditions are non-negotiable for you?", questionType: "text" as const },
  { day: 7, category: "Traditions", question: "How important is it that your partner shares your cultural background?", questionType: "choice" as const, options: ["Essential", "Very important", "Somewhat important", "Nice but not required", "Not important"] },
  { day: 8, category: "Children", question: "How do you feel about having children?", questionType: "choice" as const, options: ["Definitely want children", "Open to it", "Unsure", "Prefer not to have children", "Cannot have children"] },
  { day: 8, category: "Children", question: "What parenting values would you prioritize most?", questionType: "multi_choice" as const, options: ["Education", "Discipline", "Creativity", "Spiritual upbringing", "Independence", "Emotional intelligence", "Cultural heritage"] },
  { day: 9, category: "Personality", question: "How do you recharge — through solitude or social interaction?", questionType: "choice" as const, options: ["Strongly introvert — I need alone time", "Somewhat introverted", "Equal mix of both", "Somewhat extroverted", "Strongly extrovert — I thrive socially"] },
  { day: 9, category: "Personality", question: "Describe a moment you are most proud of in your life.", questionType: "text" as const },
  { day: 10, category: "Compatibility", question: "What is the one non-negotiable quality you look for in a partner?", questionType: "text" as const },
  { day: 10, category: "Compatibility", question: "How important is physical attraction in a long-term relationship?", questionType: "choice" as const, options: ["Extremely important", "Very important", "Moderately important", "Somewhat important", "Not a priority"] },
];

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const existing = await db.query.usersTable.findFirst({ where: eq(usersTable.email, "admin@soulmatch.ai") });
  if (!existing) {
    await db.insert(usersTable).values({
      email: "admin@soulmatch.ai",
      passwordHash: await bcrypt.hash("Admin@2026!", 12),
      firstName: "Admin",
      lastName: "SoulMatch",
      role: "superadmin",
      isEmailVerified: true,
      city: "Mumbai",
      country: "India",
    });
    console.log("Created admin user: admin@soulmatch.ai / Admin@2026!");
  }

  // Create demo users
  const demoUsers = [
    { firstName: "Priya", lastName: "Sharma", email: "priya@demo.com", gender: "female" as const, city: "Mumbai", occupation: "Software Engineer", religion: "Hindu", dateOfBirth: "1997-03-15" },
    { firstName: "Arjun", lastName: "Patel", email: "arjun@demo.com", gender: "male" as const, city: "Delhi", occupation: "Doctor", religion: "Hindu", dateOfBirth: "1994-07-22" },
    { firstName: "Sana", lastName: "Khan", email: "sana@demo.com", gender: "female" as const, city: "London", occupation: "Lawyer", religion: "Muslim", dateOfBirth: "1998-11-08" },
    { firstName: "Rohan", lastName: "Gupta", email: "rohan@demo.com", gender: "male" as const, city: "Bangalore", occupation: "Entrepreneur", religion: "Hindu", dateOfBirth: "1993-05-30" },
    { firstName: "Zara", lastName: "Ahmed", email: "zara@demo.com", gender: "female" as const, city: "Dubai", occupation: "Marketing Manager", religion: "Muslim", dateOfBirth: "1996-09-14" },
    { firstName: "Vikram", lastName: "Singh", email: "vikram@demo.com", gender: "male" as const, city: "Toronto", occupation: "Finance Analyst", religion: "Sikh", dateOfBirth: "1992-02-18" },
    { firstName: "Ananya", lastName: "Reddy", email: "ananya@demo.com", gender: "female" as const, city: "Hyderabad", occupation: "UX Designer", religion: "Hindu", dateOfBirth: "1999-06-25" },
    { firstName: "Kabir", lastName: "Malhotra", email: "kabir@demo.com", gender: "male" as const, city: "Mumbai", occupation: "Architect", religion: "Hindu", dateOfBirth: "1991-12-03" },
  ];

  const hash = await bcrypt.hash("Demo@2026!", 12);
  for (const u of demoUsers) {
    const ex = await db.query.usersTable.findFirst({ where: eq(usersTable.email, u.email) });
    if (!ex) {
      await db.insert(usersTable).values({
        ...u,
        passwordHash: hash,
        isEmailVerified: true,
        bio: `I'm ${u.firstName}, a passionate ${u.occupation} from ${u.city}. Looking for a meaningful connection built on trust, values, and mutual respect.`,
        education: "Bachelor's Degree",
        height: 160 + Math.floor(Math.random() * 25),
        maritalStatus: "never_married",
        journeyProgress: Math.floor(Math.random() * 20),
      });
      console.log(`Created user: ${u.email}`);
    }
  }

  // Seed journey questions
  const existingQ = await db.query.journeyQuestionsTable.findFirst();
  if (!existingQ) {
    for (const q of JOURNEY_QUESTIONS) {
      await db.insert(journeyQuestionsTable).values({ ...q, isActive: true });
    }
    console.log(`Seeded ${JOURNEY_QUESTIONS.length} journey questions`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
