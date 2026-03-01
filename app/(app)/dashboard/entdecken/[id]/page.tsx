import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { getAgeFromDateOfBirth, getGenderSymbol, getExperienceLabel } from "@/lib/profile-utils";
import { ChastityRequestButton } from "@/components/chastity/ChastityRequestButton";
import { FollowButton } from "@/components/FollowButton";
import { BlockButton } from "@/components/BlockButton";
import { ProfileLikeButton } from "@/components/ProfileLikeButton";
import { PostLikeButton } from "@/components/PostLikeButton";
import { PostDeleteButton } from "@/components/PostDeleteButton";
import { ProfileAlbumsSection } from "@/components/albums/ProfileAlbumsSection";
import { RoleIcon } from "@/components/RoleIcon";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { RecordProfileView } from "@/components/RecordProfileView";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString("de-DE");
}

const TABS = [
  { id: "posts", label: "Posts" },
  { id: "info", label: "Info" },
  { id: "alben", label: "Alben" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export const dynamic = "force-dynamic";

export default async function ProfilDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: TabId =
    TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : "info";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role, verified")
    .eq("id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, nick, role, gender, city, postal_code, avatar_url, avatar_photo_id, height_cm, weight_kg, body_type, date_of_birth, age_range, looking_for_gender, looking_for, preferences, expectations_text, about_me, verified, experience_level, last_seen_at"
    )
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const avatarUrl = await resolveProfileAvatarUrl(
    { avatar_url: profile.avatar_url, avatar_photo_id: profile.avatar_photo_id },
    supabase
  );

  if (user.id !== profile.id) {
    // Profilbesuch clientseitig erfassen (JWT des Besuchers)
  }

  const [{ data: followRow }, { data: blockRow }] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .maybeSingle(),
    supabase
      .from("blocked_users")
      .select("blocker_id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", profile.id)
      .maybeSingle(),
  ]);
  const isFollowing = !!followRow;
  const isBlockedByMe = !!blockRow;

  let profileLikeCount = 0;
  let profileLikedByMe = false;
  if (user.id !== profile.id) {
    const [{ count: plCount }, { data: myLike }] = await Promise.all([
      supabase.from("profile_likes").select("*", { count: "exact", head: true }).eq("profile_id", profile.id),
      supabase.from("profile_likes").select("liker_id").eq("profile_id", profile.id).eq("liker_id", user.id).maybeSingle(),
    ]);
    profileLikeCount = plCount ?? 0;
    profileLikedByMe = !!myLike;
  }

  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
  ]);

  let hasExistingChastityConnection = false;
  let subConnectionDisplay: { has_connection: boolean; dom_nick: string | null } = { has_connection: false, dom_nick: null };
  if (user.id !== profile.id) {
    const [chastityRes, connectionRes] = await Promise.all([
      supabase
        .from("chastity_arrangements")
        .select("id")
        .or(`and(dom_id.eq.${user.id},sub_id.eq.${profile.id}),and(dom_id.eq.${profile.id},sub_id.eq.${user.id})`)
        .in("status", ["pending", "active", "paused", "requested_by_sub"])
        .limit(1)
        .maybeSingle(),
      (profile.role === "Sub" || profile.role === "Switcher")
        ? supabase.rpc("get_sub_connection_display", { p_sub_id: profile.id })
        : { data: null },
    ]);
    hasExistingChastityConnection = !!chastityRes.data;
    if (connectionRes.data && connectionRes.data.length > 0) {
      const row = connectionRes.data[0] as { has_connection: boolean; dom_nick: string | null };
      subConnectionDisplay = { has_connection: row.has_connection, dom_nick: row.dom_nick };
    }
  }

  const initials = (profile.nick ?? "?")
    .split(/[\s_]+/)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabels: Record<string, string> = { Dom: "Dom", Sub: "Sub", Switcher: "Switcher" };
  const roleLabel = profile.role ? roleLabels[profile.role] ?? profile.role : null;

  const { data: albums } = await supabase
    .from("photo_albums")
    .select("id, name, is_main")
    .eq("owner_id", profile.id);

  const albumIds = albums?.map((a) => a.id) ?? [];
  const { data: requests } =
    user.id !== profile.id && albumIds.length > 0
      ? await supabase
          .from("album_view_requests")
          .select("album_id, status")
          .eq("requester_id", user.id)
          .in("album_id", albumIds)
      : { data: [] };

  const requestStatusByAlbum: Record<string, "none" | "pending" | "approved" | "rejected"> = {};
  albumIds.forEach((aid) => {
    requestStatusByAlbum[aid] = "none";
  });
  (requests ?? []).forEach((r: { album_id: string; status: string }) => {
    requestStatusByAlbum[r.album_id] = r.status as "pending" | "approved" | "rejected";
  });

  const albumsWithCovers = await Promise.all(
    (albums ?? []).map(async (album) => {
      let coverUrl: string | null = null;
      if (album.is_main && avatarUrl) {
        coverUrl = avatarUrl;
      }
      if (!coverUrl) {
        const { data: firstPhoto } = await supabase
          .from("photo_album_photos")
          .select("storage_path")
          .eq("album_id", album.id)
          .order("sort_order")
          .limit(1)
          .maybeSingle();
        coverUrl = firstPhoto?.storage_path
          ? supabase.storage.from("album-photos").getPublicUrl(firstPhoto.storage_path).data.publicUrl
          : null;
      }
      return { ...album, coverUrl };
    })
  );

  const { data: userPosts } =
    tab === "posts"
      ? await supabase
          .from("posts")
          .select("id, content, image_url, created_at")
          .eq("author_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(50)
      : { data: [] };

  const postLikeByPostId: Record<string, { count: number; likedByMe: boolean }> = {};
  if (userPosts?.length) {
    const postIds = userPosts.map((p) => p.id);
    const [countRes, myLikesRes] = await Promise.all([
      supabase.from("post_likes").select("post_id").in("post_id", postIds),
      supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
    ]);
    const countByPost = new Map<string, number>();
    (countRes.data ?? []).forEach((r: { post_id: string }) => countByPost.set(r.post_id, (countByPost.get(r.post_id) ?? 0) + 1));
    const myLikedPostIds = new Set((myLikesRes.data ?? []).map((r: { post_id: string }) => r.post_id));
    postIds.forEach((pid) => {
      postLikeByPostId[pid] = { count: countByPost.get(pid) ?? 0, likedByMe: myLikedPostIds.has(pid) };
    });
  }

  const baseUrl = `/dashboard/entdecken/${profile.id}`;

  return (
    <Container className="py-16">
      {user.id !== profile.id && (
        <RecordProfileView profileId={profile.id} viewerId={user.id} />
      )}
      <Link
        href="/dashboard/entdecken"
        className="mb-6 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Zurück zu Entdecken
      </Link>

      {/* Header: dezenter Gradient, großer Avatar, Nick, Rolle, Ort */}
      <div className="relative overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card">
        <div className="flex flex-col items-center p-6 text-center sm:flex-row sm:items-start sm:text-left">
          <AvatarWithVerified
            verified={profile.verified}
            size="lg"
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
          >
          <div className="h-full w-full overflow-hidden rounded-full border-2 border-gray-700 bg-background shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-accent sm:text-3xl">
                {initials}
              </span>
            )}
          </div>
          </AvatarWithVerified>
          <div className="mt-4 sm:ml-6 sm:mt-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              {profile.nick ?? "—"}
              {profile.verified && <VerifiedBadge size={20} showLabel />}
              <OnlineIndicator lastSeenAt={profile.last_seen_at} variant="text" />
            </h1>
            <p className="mt-1 text-gray-400">
              {roleLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <RoleIcon role={profile.role} size={18} className="text-gray-400" />
                  {roleLabel}
                </span>
              )}
              {getAgeFromDateOfBirth(profile.date_of_birth) != null && (roleLabel ? " · " : "")}
              {getAgeFromDateOfBirth(profile.date_of_birth) != null && (
                <span>{getAgeFromDateOfBirth(profile.date_of_birth)} Jahre</span>
              )}
              {getGenderSymbol(profile.gender) && (
                <span> {getGenderSymbol(profile.gender)}</span>
              )}
            </p>
            {(profile.city || profile.postal_code) && (
              <p className="mt-1 text-sm text-gray-500">
                {[profile.postal_code, profile.city].filter(Boolean).join(" ")}
              </p>
            )}
          </div>
        </div>

        {/* Statistik-Zeile: Follower / folgt */}
        <div className="flex items-center justify-center gap-8 border-t border-gray-700 px-6 py-4 sm:justify-start">
          <span className="text-gray-400">
            <span className="font-semibold text-white">{followerCount ?? 0}</span> Follower
          </span>
          <span className="text-gray-400">
            <span className="font-semibold text-white">{followingCount ?? 0}</span> folgt
          </span>
        </div>

        {/* Aktionen (Folgen, Nachricht, Keuschhaltung) */}
        {profile.id !== user.id && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-700 px-4 py-4 sm:justify-start sm:gap-3 sm:px-6">
            <FollowButton followingId={profile.id} initialIsFollowing={isFollowing} />
            <BlockButton blockedId={profile.id} initialBlocked={isBlockedByMe} />
            <ProfileLikeButton
              profileId={profile.id}
              initialLiked={profileLikedByMe}
              initialCount={profileLikeCount}
            />
            <Link
              href={`/dashboard/nachrichten?with=${profile.id}`}
              className="min-h-[44px] flex items-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-hover sm:py-2"
            >
              Nachricht senden
            </Link>
            {hasExistingChastityConnection ? (
              <span className="flex items-center gap-2 text-sm text-gray-400">
                Es besteht bereits eine Verbindung.
                <Link
                  href="/dashboard/keuschhaltung"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  Zur Keuschhaltung
                </Link>
              </span>
            ) : subConnectionDisplay.has_connection &&
              (myProfile?.role === "Dom" || myProfile?.role === "Switcher") &&
              (profile.role === "Sub" || profile.role === "Switcher") ? (
              <span className="text-sm text-gray-400">
                {subConnectionDisplay.dom_nick
                  ? `Sub bereits vergeben an ${subConnectionDisplay.dom_nick}`
                  : "Sub bereits vergeben"}
              </span>
            ) : (
              <>
                {(myProfile?.role === "Dom" || myProfile?.role === "Switcher") &&
                  (profile.role === "Sub" || profile.role === "Switcher") && (
                    <Link
                      href={`/dashboard/keuschhaltung?offer=${profile.id}`}
                      className="min-h-[44px] flex items-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-hover sm:py-2"
                    >
                      Keuschhaltung anbieten
                    </Link>
                  )}
                {(myProfile?.role === "Sub" || myProfile?.role === "Switcher") &&
                  (profile.role === "Dom" || profile.role === "Switcher") && (
                    <ChastityRequestButton domId={profile.id} />
                  )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card shadow-sm">
        <div className="flex border-b border-gray-700">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`${baseUrl}?tab=${t.id}`}
              className={`flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-b-2 border-accent text-accent"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="p-6">
          {tab === "posts" && (
            <>
              {userPosts && userPosts.length > 0 ? (
                <ul className="space-y-6">
                  {userPosts.map((post) => (
                    <li
                      key={post.id}
                      className="overflow-hidden rounded-xl border border-gray-700 bg-background/50"
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-700 bg-background">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                              {initials}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-white">{profile.nick ?? "—"}</span>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(new Date(post.created_at))}
                          </p>
                        </div>
                      </div>
                        <div className="border-t border-gray-700 px-4 pb-4 pt-1">
                        <p className="whitespace-pre-wrap text-gray-300">{post.content}</p>
                        {post.image_url && (
                          <div className="mt-4 overflow-hidden rounded-lg">
                            <img
                              src={
                                supabase.storage
                                  .from("post-images")
                                  .getPublicUrl(post.image_url).data.publicUrl
                              }
                              alt=""
                              className="max-h-[28rem] w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-4">
                          <PostLikeButton
                            postId={post.id}
                            initialLiked={postLikeByPostId[post.id]?.likedByMe ?? false}
                            initialCount={postLikeByPostId[post.id]?.count ?? 0}
                          />
                          {profile.id === user.id && (
                            <PostDeleteButton
                              postId={post.id}
                              imageUrl={post.image_url}
                            />
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-gray-500">
                  Noch keine Posts von dieser Person.
                </p>
              )}
            </>
          )}

          {tab === "info" && (
            <div className="space-y-6">
              {(profile.height_cm || profile.weight_kg || profile.body_type) && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Körper
                  </h2>
                  <p className="mt-2 text-white">
                    {[
                      profile.height_cm && `${profile.height_cm} cm`,
                      profile.weight_kg && `${profile.weight_kg} kg`,
                      profile.body_type,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              )}

              {(profile.age_range || getAgeFromDateOfBirth(profile.date_of_birth) != null) && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Alter
                  </h2>
                  <p className="mt-2 text-white">
                    {getAgeFromDateOfBirth(profile.date_of_birth) != null
                      ? `${getAgeFromDateOfBirth(profile.date_of_birth)} Jahre`
                      : profile.age_range ?? "—"}
                  </p>
                </div>
              )}

              {getExperienceLabel(profile.experience_level) && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Erfahrung
                  </h2>
                  <p className="mt-2 text-white">{getExperienceLabel(profile.experience_level)}</p>
                </div>
              )}

              {profile.looking_for_gender && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Wen sucht die Person?
                  </h2>
                  <p className="mt-2 text-white">{profile.looking_for_gender}</p>
                </div>
              )}

              {Array.isArray(profile.looking_for) && profile.looking_for.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Was sucht die Person?
                  </h2>
                  <p className="mt-2 text-white">{profile.looking_for.join(", ")}</p>
                </div>
              )}

              {Array.isArray(profile.preferences) && profile.preferences.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Vorlieben
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.preferences.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-accent/20 px-3 py-1 text-sm text-accent"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.expectations_text && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Was erwartet die Person von ihrem Gesuchten?
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-gray-300">
                    {profile.expectations_text}
                  </p>
                </div>
              )}

              {profile.about_me && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Über die Person
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-gray-300">{profile.about_me}</p>
                </div>
              )}

              {!profile.height_cm &&
                !profile.weight_kg &&
                !profile.body_type &&
                !profile.age_range &&
                getAgeFromDateOfBirth(profile.date_of_birth) == null &&
                !getExperienceLabel(profile.experience_level) &&
                !profile.looking_for_gender &&
                !(Array.isArray(profile.looking_for) && profile.looking_for.length) &&
                !(Array.isArray(profile.preferences) && profile.preferences.length) &&
                !profile.expectations_text &&
                !profile.about_me && (
                  <p className="text-sm text-gray-500">Keine weiteren Angaben hinterlegt.</p>
                )}
            </div>
          )}

          {tab === "alben" && (
            <ProfileAlbumsSection
              ownerId={profile.id}
              viewerId={user.id}
              albums={albumsWithCovers}
              requestStatusByAlbum={requestStatusByAlbum}
              ownerAvatarUrl={avatarUrl}
              isViewerVerified={myProfile?.verified ?? false}
            />
          )}
        </div>
      </div>
    </Container>
  );
}
