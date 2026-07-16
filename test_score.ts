function calculateProfileCompleteness(user: Record<string, unknown>, photos?: any[]): number {
  const fields = [
    "firstName", "lastName", "dateOfBirth", "gender", "bio",
    "height", "weight", "maritalStatus",
    "occupation", "company", "education", "fieldOfStudy", "industry", "annualIncomeRange",
    "country", "stateRegion", "city", "citizenship", "languages", "religion"
  ];
  const filled = fields.filter((f) => user[f] != null && user[f] !== "" && (!Array.isArray(user[f]) || (user[f] as any[]).length > 0)).length;
  let score = (filled / fields.length) * 80;
  if (user.verificationStatus === "verified" || user.isGovIdVerified || user.isSelfieVerified) score += 10;
  if (Array.isArray(photos) && photos.length > 0) score += 10;
  return Math.min(100, Math.round(score));
}

const fullUser = {
    firstName: "a", lastName: "b", dateOfBirth: "c", gender: "d", bio: "e",
    height: 170, weight: 65, maritalStatus: "single",
    occupation: "dev", company: "acme", education: "bs", fieldOfStudy: "cs", industry: "tech", annualIncomeRange: "100k",
    country: "us", stateRegion: "ca", city: "sf", citizenship: "us", languages: ["en"], religion: "none",
    verificationStatus: "unverified",
    isGovIdVerified: true,
    isSelfieVerified: true
};

const emptyUser = {};

const photos = [{ url: "foo" }];

console.log("Full User Score:", calculateProfileCompleteness(fullUser, photos));
console.log("Empty User Score:", calculateProfileCompleteness(emptyUser, []));
