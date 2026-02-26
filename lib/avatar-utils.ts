import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileForAvatar = {
  avatar_url?: string | null;
  avatar_photo_id?: string | null;
  avatar_photo?: { storage_path: string } | null;
};

/**
 * Gibt die effektive Avatar-URL zurück.
 * Priorität: 1) avatar_photo_id + avatar_photo, 2) avatar_url, 3) null
 * Erfordert, dass bei avatar_photo_id das avatar_photo per JOIN geladen wurde.
 */
export function getProfileAvatarUrl(
  profile: ProfileForAvatar,
  supabase: SupabaseClient
): string | null {
  if (profile.avatar_photo_id && profile.avatar_photo?.storage_path) {
    return supabase.storage
      .from("album-photos")
      .getPublicUrl(profile.avatar_photo.storage_path).data.publicUrl;
  }
  if (profile.avatar_url) {
    return supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data.publicUrl;
  }
  return null;
}

/**
 * Asynchron: Lädt ggf. das avatar_photo nach, falls nur avatar_photo_id gesetzt.
 */
export async function resolveProfileAvatarUrl(
  profile: ProfileForAvatar,
  supabase: SupabaseClient
): Promise<string | null> {
  const sync = getProfileAvatarUrl(profile, supabase);
  if (sync) return sync;
  if (profile.avatar_photo_id) {
    const { data } = await supabase
      .from("photo_album_photos")
      .select("storage_path")
      .eq("id", profile.avatar_photo_id)
      .single();
    if (data?.storage_path) {
      return supabase.storage
        .from("album-photos")
        .getPublicUrl(data.storage_path).data.publicUrl;
    }
  }
  return null;
}
