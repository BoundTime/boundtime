import type { SupabaseClient } from "@supabase/supabase-js";

/** Follower-/Folgt-Listen bei fremden privaten Profilen nur bei gegenseitigem Folgen. */
export async function canViewerSeeFollowLists(
  supabase: SupabaseClient,
  viewerId: string,
  profileUserId: string
): Promise<boolean> {
  if (viewerId === profileUserId) return true;
  const { data: row } = await supabase
    .from("profiles")
    .select("profile_private")
    .eq("id", profileUserId)
    .maybeSingle();
  const isPrivate = (row as { profile_private?: boolean } | null)?.profile_private === true;
  if (!isPrivate) return true;
  const [{ data: iFollow }, { data: theyFollowMe }] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", viewerId)
      .eq("following_id", profileUserId)
      .maybeSingle(),
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", profileUserId)
      .eq("following_id", viewerId)
      .maybeSingle(),
  ]);
  return !!(iFollow && theyFollowMe);
}

export type FollowListProfileRow = {
  id: string;
  nick: string | null;
  avatar_url: string | null;
  avatar_photo_id: string | null;
  verified: boolean;
};

/**
 * Lädt Profile, die einem Nutzer folgen (followers) bzw. denen er folgt (following),
 * sortiert nach Zeitpunkt des Follows (neueste zuerst).
 */
export async function fetchFollowListProfiles(
  supabase: SupabaseClient,
  profileUserId: string,
  kind: "followers" | "following"
): Promise<FollowListProfileRow[]> {
  if (kind === "followers") {
    const { data: rows } = await supabase
      .from("follows")
      .select("follower_id, created_at")
      .eq("following_id", profileUserId)
      .order("created_at", { ascending: false });
    const ids = (rows ?? []).map((r) => r.follower_id);
    if (ids.length === 0) return [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nick, avatar_url, avatar_photo_id, verified")
      .in("id", ids);
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as FollowListProfileRow[];
  }

  const { data: rows } = await supabase
    .from("follows")
    .select("following_id, created_at")
    .eq("follower_id", profileUserId)
    .order("created_at", { ascending: false });
  const ids = (rows ?? []).map((r) => r.following_id);
  if (ids.length === 0) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nick, avatar_url, avatar_photo_id, verified")
    .in("id", ids);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as FollowListProfileRow[];
}
