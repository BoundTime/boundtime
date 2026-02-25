/** Berechnet das Alter in Jahren aus dem Geburtsdatum */
export function getAgeFromDateOfBirth(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  return age >= 0 ? age : null;
}

/** Geschlechtszeichen für die Anzeige */
export const GENDER_SYMBOLS: Record<string, string> = {
  Mann: "♂",
  Frau: "♀",
  Divers: "⚧",
};

export function getGenderSymbol(gender: string | null | undefined): string | null {
  if (!gender) return null;
  return GENDER_SYMBOLS[gender] ?? null;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Einsteiger:in",
  experienced: "Erfahren",
  advanced: "Sehr erfahren",
};

export function getExperienceLabel(level: string | null | undefined): string | null {
  if (!level) return null;
  return EXPERIENCE_LABELS[level] ?? null;
}
