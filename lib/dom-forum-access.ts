export type DomForumProfileCheck = {
  role: string | null;
  verified: boolean;
};

export function hasDomForumAccess(profile: DomForumProfileCheck | null | undefined): boolean {
  if (!profile) return false;
  return profile.verified === true && (profile.role === "Dom" || profile.role === "Switcher");
}
