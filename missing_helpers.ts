export async function buildUserProfile(user: any) {
  const photos = await db.select().from(photosTable).where(eq(photosTable.userId, user.id));
  return {
    ...user,
    age: calculateAge(user.dateOfBirth),
    photos: photos.map((p: any) => ({
      id: p.id,
      url: p.url,
      isPrimary: p.isPrimary,
      caption: p.caption,
      orderIndex: p.orderIndex
    }))
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
