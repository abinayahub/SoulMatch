export const MANDATORY_FIELDS = [
  { key: "firstName", label: "Full Name", section: "personal" },
  { key: "dateOfBirth", label: "Date of Birth", section: "personal" },
  { key: "gender", label: "Gender", section: "personal" },
  { key: "maritalStatus", label: "Marital Status", section: "personal" },
  { key: "height", label: "Height", section: "personal" },
  { key: "bio", label: "About You", section: "personal" },
  { key: "education", label: "Education", section: "professional" },
  { key: "occupation", label: "Profession", section: "professional" },
  { key: "country", label: "Location", section: "location" }
];

export function getMandatoryCompletion(p: any) {
  if (!p) return { percentage: 0, status: [], missingCount: MANDATORY_FIELDS.length };
  
  const status = MANDATORY_FIELDS.map(field => {
    const isFilled = p[field.key] != null && p[field.key] !== "" && (!Array.isArray(p[field.key]) || p[field.key].length > 0);
    return { ...field, isFilled };
  });
  
  const filledCount = status.filter(s => s.isFilled).length;
  
  return {
    percentage: typeof p.profileCompleteness === 'number' ? p.profileCompleteness : Math.round((filledCount / MANDATORY_FIELDS.length) * 100),
    status,
    missingCount: MANDATORY_FIELDS.length - filledCount
  };
}
