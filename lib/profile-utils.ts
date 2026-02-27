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

/** Anzahl Slots für Profil-Fortschritt (muss mit getProfileProgress übereinstimmen) */
const PROFILE_SLOTS = 10;

/**
 * Berechnet den Profil-Fortschritt in Prozent (0–100).
 * Gleiche Logik wie im Dashboard – für Verifizierungsstufe Silber (≥80%).
 */
export function getProfileProgress(profile: Record<string, unknown> | null): number {
  if (!profile) return 0;
  let filled = 0;
  if (profile.avatar_url || profile.avatar_photo_id) filled++;
  if (profile.postal_code || profile.city) filled++;
  if (profile.height_cm != null && profile.height_cm !== "") filled++;
  if (profile.weight_kg != null && profile.weight_kg !== "") filled++;
  if (profile.body_type) filled++;
  if (profile.date_of_birth || profile.age_range) filled++;
  if (profile.looking_for_gender) filled++;
  const lf = profile.looking_for;
  if (Array.isArray(lf) && lf.length > 0) filled++;
  else if (lf) filled++;
  if (profile.expectations_text && String(profile.expectations_text).trim()) filled++;
  if (profile.about_me && String(profile.about_me).trim()) filled++;
  return Math.round((filled / PROFILE_SLOTS) * 100);
}

/** Bestimmt verification_tier: gold wenn verified, sonst silver bei ≥80%, sonst bronze */
export function computeVerificationTier(
  verified: boolean,
  progress: number
): "bronze" | "silver" | "gold" {
  if (verified) return "gold";
  if (progress >= 80) return "silver";
  return "bronze";
}
