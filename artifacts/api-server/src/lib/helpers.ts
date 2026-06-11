import { db } from "@workspace/db";
import { usersTable, photosTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function calculateProfileCompleteness(user: Record<string, unknown>): number {
  const fields = [
    "firstName", "lastName", "dateOfBirth", "gender", "bio",
    "occupation", "education", "religion", "city", "country", "height",
  ];
  const filled = fields.filter((f) => user[f] != null && user[f] !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export async function buildPublicProfile(userId: number, viewerUserId?: number) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });
  if (!user) return null;

  const photos = await db.select().from(photosTable).where(eq(photosTable.userId, userId));

  return {
    id: user.id,
    firstName: user.firstName,
    displayName: user.displayName,
    age: calculateAge(user.dateOfBirth),
    occupation: user.occupation,
    education: user.education,
    city: user.city,
    country: user.country,
    religion: user.religion,
    bio: user.bio,
    photos: photos.map((p) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId })),
    verificationStatus: user.verificationStatus,
    isPremium: user.role === "premium" || user.role === "admin" || user.role === "superadmin",
    compatibilityScore: viewerUserId ? Math.floor(Math.random() * 30 + 65) : null,
    journeyProgress: user.journeyProgress,
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
    profileCompleteness: calculateProfileCompleteness(user as unknown as Record<string, unknown>),
    createdAt: user.createdAt.toISOString(),
  };
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
