Created At: 2026-06-19T04:57:21Z
Completed At: 2026-06-19T04:57:21Z
File Path: `file:///c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/api-server/src/lib/helpers.ts`
Total Lines: 352
Total Bytes: 15834
Showing lines 1 to 352
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
import { db } from "@workspace/db";
import { usersTable, photosTable, compatibilityScoresTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import { personalityProfilesTable } from "@workspace/db";

export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function calculateProfileCompleteness(user: Record<string, unknown>, photos?: any[]): number {
  const fields = [
    "firstName", "lastName", "dateOfBirth", "gender", "bio",
    "height", "weight", "maritalStatus",
    "occupation", "company", "education", "fieldOfStudy", "industry", "annualIncomeRange",
    "country", "stateRegion", "city", "citizenship", "languages", "religion",
    "dietaryPreference", "smoking", "drinking", "interests"
  ];
  const filled = fields.filter((f) => user[f] != null && user[f] !== "" && (!Array.isArray(user[f]) || (user[f] as any[]).length > 0)).length;
  let score = (filled / fields.length) * 100;
  return Math.min(100, Math.round(score));
}

export async function calculateAndStoreCompatibility(currentUserProfile: any, targetUserProfile: any, currentUserId: number, targetUserId: number) {
  // Check if we alread
<truncated 13956 bytes>
 user.role === "premium" || user.role === "admin" || user.role === "superadmin",
    compatibilityScore,
    journeyProgress: user.journeyProgress,
    isMutualMatch,
    hasPendingInterest,
    interestSentByViewer,
    pendingInterestId,
  };
}

export async function buildUserProfile(user: typeof usersTable.$inferSelect) {
  const photos = await db.select().from(photosTable).where(eq(photosTable.userId, user.id));
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    dateOfBirth: user.dateOfBirth,
    age: calculateAge(user.dateOfBirth),
    gender: user.gender,
    phone: user.phone,
    bio: user.bio,
    occupation: user.occupation,
    education: user.education,
    religion: user.religion,
    motherTongue: user.motherTongue,
    city: user.city,
    country: user.country,
    height: user.height,
    maritalStatus: user.maritalStatus,
    dietaryPreference: user.dietaryPreference,
    smoking: user.smoking,
    drinking: user.drinking,
    photos: photos.map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
    role: user.role,
    verificationStatus: user.verificationStatus,
    isPhoneVerified: user.isPhoneVerified,
    isEmailVerified: user.isEmailVerified,
    journeyProgress: user.journeyProgress,
    isPremium: user.role === "premium" || user.role === "admin" || user.role === "superadmin",
    profileCompleteness: calculateProfileCompleteness(user as unknown as Record<string, unknown>, photos),
    createdAt: user.createdAt.toISOString(),
  };
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

The above content shows the entire, complete file contents of the requested file.
