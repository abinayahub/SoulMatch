function calculateProfileCompleteness(user) {
  const fields = [
    "firstName", "lastName", "dateOfBirth", "gender", "bio",
    "height", "weight", "maritalStatus",
    "occupation", "company", "education", "fieldOfStudy", "industry", "annualIncomeRange",
    "country", "stateRegion", "city", "citizenship", "languages", "religion"
  ];
  const filled = fields.filter((f) => user[f] != null && user[f] !== "" && (!Array.isArray(user[f]) || user[f].length > 0)).length;
  console.log("Filled fields count:", filled);
  console.log("Filled fields:", fields.filter((f) => user[f] != null && user[f] !== "" && (!Array.isArray(user[f]) || user[f].length > 0)));
  
  let score = (filled / fields.length) * 100;
  return Math.min(100, Math.round(score));
}

const user = {
  id: 2,
  email: 'mani@gmail.com',
  firstName: 'Mani',
  lastName: 'G',
  displayName: null,
  dateOfBirth: '2008-06-01',
  gender: 'male',
  phone: null,
  bio: 'I am want a perfect partner',
  occupation: 'Software engineer',
  education: 'bachelors',
  religion: 'hinduism',
  motherTongue: null,
  city: 'Madurai',
  country: 'India',
  height: 170,
  maritalStatus: 'never_married',
  dietaryPreference: null,
  smoking: null,
  drinking: null,
  interests: null,
  languages: [ 'Tamil', 'english' ],
  role: 'user',
  status: 'active',
  verificationStatus: 'unverified',
  isPhoneVerified: false,
  isEmailVerified: false,
  journeyProgress: 0,
  googleId: null,
  weight: null,
  fieldOfStudy: null,
  company: null,
  industry: null,
  annualIncomeRange: null,
  stateRegion: null,
  citizenship: null,
  videoIntroUrl: null,
  isGovIdVerified: false,
  isSelfieVerified: false,
  govIdFrontUrl: null,
  govIdBackUrl: null,
  selfieUrl: null
};

console.log("Calculated Score:", calculateProfileCompleteness(user));
