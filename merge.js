const fs = require('fs');

const custom = fs.readFileSync('c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/custom_helpers.ts', 'utf-8');

const ts = `import { db } from "@workspace/db";
import { usersTable, photosTable, compatibilityScoresTable, personalityProfilesTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";

export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export async function buildPublicProfile(userId: number, viewerUserId?: number) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });
  if (!user) return null;

  const photos = await db.select().from(photosTable).where(eq(photosTable.userId, userId));

  let isMutualMatch = false;
  let hasPendingInterest = false;
  let interestSentByViewer = false;
  let pendingInterestId = null;

  if (viewerUserId && viewerUserId !== userId) {
    const { interestsTable } = await import("@workspace/db");
    const interests = await db.select().from(interestsTable).where(
      or(
        and(eq(interestsTable.fromUserId, viewerUserId), eq(interestsTable.toUserId, userId)),
        and(eq(interestsTable.fromUserId, userId), eq(interestsTable.toUserId, viewerUserId))
      )
    );

    for (const interest of interests) {
      if (interest.status === "accepted") isMutualMatch = true;
      if (interest.status === "pending") {
        hasPendingInterest = true;
        pendingInterestId = interest.id;
        if (interest.fromUserId === viewerUserId) interestSentByViewer = true;
      }
    }
  }

  const isFullyVisible = isMutualMatch || viewerUserId === userId;
  let compatibilityScore = null;

  if (viewerUserId && viewerUserId !== userId) {
    const viewerProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, viewerUserId) });
    const targetProfile = await db.query.personalityProfilesTable.findFirst({ where: eq(personalityProfilesTable.userId, userId) });
    if (viewerProfile && targetProfile) {
      const result = await calculateAndStoreCompatibility(viewerProfile, targetProfile, viewerUserId, userId);
      compatibilityScore = result.compatibilityScore;
    }
  }

  return {
    id: user.id,
    firstName: user.firstName,
    displayName: user.displayName,
    age: calculateAge(user.dateOfBirth),
    occupation: isFullyVisible ? user.occupation : null,
    education: isFullyVisible ? user.education : null,
    city: user.city,
    country: user.country,
    religion: isFullyVisible ? user.religion : null,
    bio: isFullyVisible ? user.bio : "This user's bio is hidden. Connect to see their full profile!",
    photos: isFullyVisible
      ? photos.map((p: any) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId }))
      : photos.slice(0, 1).map((p: any) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
    verificationStatus: user.verificationStatus,
    isPremium: user.role === "premium" || user.role === "admin" || user.role === "superadmin",
    compatibilityScore,
    journeyProgress: user.journeyProgress,
    isMutualMatch,
    hasPendingInterest,
    interestSentByViewer,
    pendingInterestId,
  };
}

` + custom.replace(/import .*?;\n/g, '').trim() + `

export async function buildUserProfile(user: any) {
  const photos = await db.select().from(photosTable).where(eq(photosTable.userId, user.id));
  return {
    ...user,
    age: calculateAge(user.dateOfBirth),
    photos: photos.map((p: any) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
    profileCompleteness: calculateProfileCompleteness(user, photos),
  };
}

export function calculateProfileCompleteness(user: any, photos: any[] = []) {
  const fields = [
    "firstName", "lastName", "dateOfBirth", "gender", "bio",
    "height", "weight", "maritalStatus",
    "occupation", "company", "education", "fieldOfStudy", "industry", "annualIncomeRange",
    "country", "stateRegion", "city", "citizenship", "languages", "religion",
    "dietaryPreference", "smoking", "drinking", "interests"
  ];
  const filled = fields.filter(f => user[f] != null && user[f] !== "" && (!Array.isArray(user[f]) || user[f].length > 0)).length;
  const score = (filled / fields.length) * 100;
  return Math.min(100, Math.round(score));
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
`;

fs.writeFileSync('c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/api-server/src/lib/helpers.ts', ts);
