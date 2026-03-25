import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { getAgeFromDateOfBirth, getGenderSymbol, getExperienceLabel, getLookingForGenderDisplay, getOrientationLabel } from "@/lib/profile-utils";
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
import { formatMemberSince } from "@/lib/member-since";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { BullRatingsSection } from "@/components/bull/BullRatingsSection";
import { User, BadgeCheck, Sparkles, ChevronLeft } from "lucide-react";

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
    .select("role, verified, account_type, gender, restriction_enabled, restriction_no_messages, restriction_no_images")
    .eq("id", user.id)
    .single();

  const viewerNoImages =
    myProfile?.account_type === "couple" &&
    myProfile?.restriction_enabled === true &&
    myProfile?.restriction_no_images === true;
  const viewerNoMessages =
    myProfile?.account_type === "couple" &&
    myProfile?.restriction_enabled === true &&
    myProfile?.restriction_no_messages === true;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, nick, role, gender, city, postal_code, current_postal_code, current_city, avatar_url, avatar_photo_id, height_cm, weight_kg, body_type, date_of_birth, age_range, looking_for_gender, looking_for_genders, looking_for, preferences, expectations_text, about_me, verified, experience_level, last_seen_at, created_at, account_type, couple_type, couple_first_is, partner_date_of_birth, partner_height_cm, partner_weight_kg, partner_body_type, partner_about_me, partner_preferences, partner_experience_level, couple_female_avatar_photo_id, couple_male_avatar_photo_id, orientation, profile_private"
    )
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const avatarUrlResolved = await resolveProfileAvatarUrl(
    { avatar_url: profile.avatar_url, avatar_photo_id: profile.avatar_photo_id },
    supabase
  );
  const avatarUrl = viewerNoImages ? null : avatarUrlResolved;

  const profileWithCoupleAvatars = profile as typeof profile & {
    couple_female_avatar_photo_id?: string | null;
    couple_male_avatar_photo_id?: string | null;
  };
  const [femaleAvatarResolved, maleAvatarResolved] = await Promise.all([
    resolveProfileAvatarUrl({ avatar_photo_id: profileWithCoupleAvatars.couple_female_avatar_photo_id ?? null }, supabase),
    resolveProfileAvatarUrl({ avatar_photo_id: profileWithCoupleAvatars.couple_male_avatar_photo_id ?? null }, supabase),
  ]);
  const femaleAvatarUrl = viewerNoImages ? null : femaleAvatarResolved;
  const maleAvatarUrl = viewerNoImages ? null : maleAvatarResolved;

  if (user.id !== profile.id) {
    // Profilbesuch clientseitig erfassen (JWT des Besuchers)
  }

  const [{ data: followRow }, { data: reverseFollowRow }, { data: blockRow }] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .maybeSingle(),
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", profile.id)
      .eq("following_id", user.id)
      .maybeSingle(),
    supabase
      .from("blocked_users")
      .select("blocker_id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", profile.id)
      .maybeSingle(),
  ]);
  const isFollowing = !!followRow;
  const profileFollowsMe = !!reverseFollowRow;
  const isConnected = isFollowing && profileFollowsMe; // Verbunden = gegenseitiges Folgen
  const isBlockedByMe = !!blockRow;
  const profilePrivate = (profile as { profile_private?: boolean }).profile_private === true;
  const showLimitedProfile = profilePrivate && !isConnected && user.id !== profile.id;

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

  const roleLabels: Record<string, string> = { Dom: "Dom", Sub: "Sub", Switcher: "Switcher", Bull: "Bull" };
  const roleLabel = profile.role ? roleLabels[profile.role] ?? profile.role : null;
  const memberSinceLabel = formatMemberSince(
    (profile as { created_at?: string | null }).created_at ?? null
  );

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

  let bullRatings: { id: string; rater_id: string; rating: number; comment: string | null; created_at: string }[] = [];
  let bullRaterNickById: Record<string, string | null> = {};
  if (profile.role === "Bull") {
    const { data: ratingsData } = await supabase
      .from("bull_ratings")
      .select("id, rater_id, rating, comment, created_at")
      .eq("bull_id", profile.id);
    bullRatings = (ratingsData ?? []) as typeof bullRatings;
    const raterIds = Array.from(new Set(bullRatings.map((r) => r.rater_id)));
    if (raterIds.length > 0) {
      const { data: raters } = await supabase.from("profiles").select("id, nick").in("id", raterIds);
      bullRaterNickById = Object.fromEntries(((raters ?? []) as { id: string; nick: string | null }[]).map((p) => [p.id, p.nick]));
    }
  }

  const albumsWithCovers = await Promise.all(
    (albums ?? []).map(async (album) => {
      if (viewerNoImages) return { ...album, coverUrl: null as string | null };
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
  const canOpenFollowLists = !showLimitedProfile;

  const followStatTileClass =
    "block rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center transition-colors";
  const followStatTileInteractive =
    " hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]";

  return (
    <Container className="py-10 md:py-14">
      {user.id !== profile.id && (
        <RecordProfileView profileId={profile.id} viewerId={user.id} />
      )}
      <Link
        href="/dashboard/entdecken"
        className="group mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-gray-300 transition-[border-color,background-color,color] duration-200 hover:border-white/18 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
      >
        <ChevronLeft className="h-4 w-4 text-amber-200/65 transition-colors group-hover:text-amber-100" strokeWidth={1.75} aria-hidden />
        Zurück zu Entdecken
      </Link>

      <div className="relative overflow-hidden rounded-[1.35rem] border border-amber-200/[0.1] bg-gradient-to-b from-[#1c1a18] via-[#141414] to-[#0e0e10] shadow-[0_32px_70px_-42px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.05]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_0%,rgba(180,140,60,0.12),transparent_52%),radial-gradient(ellipse_90%_70%_at_100%_100%,rgba(0,0,0,0.82),transparent_48%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
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
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-100">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Profil-Identitaet
                </div>
                <h1 className="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold text-white sm:text-3xl md:justify-start">
              {profile.nick ?? "—"}
              {profile.verified && <VerifiedBadge size={20} showLabel />}
              <OnlineIndicator lastSeenAt={profile.last_seen_at} variant="text" />
            </h1>
            {memberSinceLabel ? (
              <p className="mt-1 text-xs text-gray-500">{memberSinceLabel}</p>
            ) : null}
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-gray-100">
              <BadgeCheck className={`h-3.5 w-3.5 ${profile.verified ? "text-emerald-300" : "text-gray-400"}`} strokeWidth={1.8} />
              <span>{profile.verified ? "Verifiziert" : "Nicht verifiziert"}</span>
            </div>
            <p className="mt-1 text-gray-300">
              {(profile as { account_type?: string }).account_type === "couple" ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm">Paar</span>
              ) : (
                <>
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
                </>
              )}
            </p>
            {(profile.city || profile.postal_code) && (
                  <p className="mt-2 text-sm text-gray-400">
                {[profile.postal_code, profile.city].filter(Boolean).join(" ")}
              </p>
            )}
            {(profile as { current_postal_code?: string | null; current_city?: string | null }).current_postal_code || (profile as { current_city?: string | null }).current_city ? (
                  <p className="mt-1 text-sm text-gray-400">
                <span className="text-gray-300">Aktuell hier: </span>
                {[(profile as { current_postal_code?: string | null }).current_postal_code, (profile as { current_city?: string | null }).current_city].filter(Boolean).join(" ")}
              </p>
            ) : null}
              </div>
            </div>
            {profile.id !== user.id && (
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
                <FollowButton followingId={profile.id} initialIsFollowing={isFollowing} />
                <ProfileLikeButton
                  profileId={profile.id}
                  initialLiked={profileLikedByMe}
                  initialCount={profileLikeCount}
                />
                {viewerNoMessages ? (
                  <span className="min-h-[44px] flex items-center rounded-lg border border-gray-600 bg-gray-800/60 px-4 py-3 text-sm text-gray-400 sm:py-2" title="Nachrichten sind im Cuckymode eingeschränkt">
                    Nachricht senden (eingeschränkt)
                  </span>
                ) : (
                  <Link
                    href={`/dashboard/nachrichten?with=${profile.id}`}
                    className="min-h-[44px] flex items-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-hover sm:py-2"
                  >
                    Nachricht senden
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-3 border-t border-white/10 pt-5 md:grid-cols-2">
            {canOpenFollowLists ? (
              <Link
                href={`${baseUrl}/follower`}
                className={`${followStatTileClass}${followStatTileInteractive}`}
                aria-label="Follower anzeigen"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Follower</p>
                <p className="mt-1 text-xl font-semibold text-white">{followerCount ?? 0}</p>
              </Link>
            ) : (
              <div className={followStatTileClass} title="Nach Verbindung mit diesem Profil sichtbar">
                <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Follower</p>
                <p className="mt-1 text-xl font-semibold text-white">{followerCount ?? 0}</p>
              </div>
            )}
            {canOpenFollowLists ? (
              <Link
                href={`${baseUrl}/folgt`}
                className={`${followStatTileClass}${followStatTileInteractive}`}
                aria-label="Accounts anzeigen, denen dieses Profil folgt"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Folgt</p>
                <p className="mt-1 text-xl font-semibold text-white">{followingCount ?? 0}</p>
              </Link>
            ) : (
              <div className={followStatTileClass} title="Nach Verbindung mit diesem Profil sichtbar">
                <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Folgt</p>
                <p className="mt-1 text-xl font-semibold text-white">{followingCount ?? 0}</p>
              </div>
            )}
          </div>

          {profile.id !== user.id && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
              <BlockButton blockedId={profile.id} initialBlocked={isBlockedByMe} />
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
      </div>

      {showLimitedProfile ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-card p-6">
          <p className="text-center text-sm text-gray-300">
            Dieses Profil ist privat. Du siehst nur Profilbild, Ort und Alter. Sende eine Nachricht oder folge, um verbunden zu werden und das vollständige Profil zu sehen.
          </p>
        </div>
      ) : (
      <>
      <div className="mt-6 rounded-2xl border border-white/10 bg-card shadow-sm">
        <div className="flex border-b border-white/10">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`${baseUrl}?tab=${t.id}`}
              className={`flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-b-2 border-accent text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="p-5 md:p-6">
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
                        {post.image_url && !viewerNoImages && (
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
                        {post.image_url && viewerNoImages && (
                          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-amber-200/90">
                            Bild im Cuckymode für dich ausgeblendet.
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

          {tab === "info" && (() => {
            const p = profile as typeof profile & {
              account_type?: string | null;
              couple_type?: string | null;
              couple_first_is?: string | null;
              partner_date_of_birth?: string | null;
              partner_height_cm?: number | null;
              partner_weight_kg?: number | null;
              partner_body_type?: string | null;
              partner_about_me?: string | null;
              partner_preferences?: string[] | null;
              partner_experience_level?: string | null;
            };
            const isCouple = p.account_type === "couple";
            const isCoupleWomanMan = isCouple && p.couple_type === "man_woman";
            const womanFirst = p.couple_first_is === "woman";
            type PartnerData = { height_cm?: number | null; weight_kg?: number | null; body_type?: string | null; date_of_birth?: string | null; preferences?: string[]; experience_level?: string | null; about_me?: string | null };
            const left: PartnerData = isCoupleWomanMan
              ? (womanFirst ? { height_cm: p.height_cm, weight_kg: p.weight_kg, body_type: p.body_type, date_of_birth: p.date_of_birth ?? undefined, preferences: Array.isArray(p.preferences) ? p.preferences : [], experience_level: p.experience_level ?? undefined, about_me: p.about_me ?? undefined }
                : { height_cm: p.partner_height_cm, weight_kg: p.partner_weight_kg, body_type: p.partner_body_type ?? undefined, date_of_birth: p.partner_date_of_birth ?? undefined, preferences: Array.isArray(p.partner_preferences) ? p.partner_preferences : [], experience_level: p.partner_experience_level ?? undefined, about_me: p.partner_about_me ?? undefined })
              : { height_cm: p.height_cm, weight_kg: p.weight_kg, body_type: p.body_type, date_of_birth: p.date_of_birth ?? undefined, preferences: Array.isArray(p.preferences) ? p.preferences : [], experience_level: p.experience_level ?? undefined, about_me: p.about_me ?? undefined };
            const right: PartnerData = isCoupleWomanMan
              ? (womanFirst ? { height_cm: p.partner_height_cm, weight_kg: p.partner_weight_kg, body_type: p.partner_body_type ?? undefined, date_of_birth: p.partner_date_of_birth ?? undefined, preferences: Array.isArray(p.partner_preferences) ? p.partner_preferences : [], experience_level: p.partner_experience_level ?? undefined, about_me: p.partner_about_me ?? undefined }
                : { height_cm: p.height_cm, weight_kg: p.weight_kg, body_type: p.body_type, date_of_birth: p.date_of_birth ?? undefined, preferences: Array.isArray(p.preferences) ? p.preferences : [], experience_level: p.experience_level ?? undefined, about_me: p.about_me ?? undefined })
              : { height_cm: p.partner_height_cm, weight_kg: p.partner_weight_kg, body_type: p.partner_body_type ?? undefined, date_of_birth: p.partner_date_of_birth ?? undefined, preferences: Array.isArray(p.partner_preferences) ? p.partner_preferences : [], experience_level: p.partner_experience_level ?? undefined, about_me: p.partner_about_me ?? undefined };
            const leftLabel = isCoupleWomanMan ? "Frau" : "Partner:in 1";
            const rightLabel = isCoupleWomanMan ? "Mann" : "Partner:in 2";
            const leftAvatarUrlResolved = isCoupleWomanMan ? (womanFirst ? femaleAvatarUrl : maleAvatarUrl) : (isCouple ? avatarUrl : null);
            const rightAvatarUrlResolved = isCoupleWomanMan ? (womanFirst ? maleAvatarUrl : femaleAvatarUrl) : (isCouple ? avatarUrl : null);
            const roleLabels: Record<string, string> = { Dom: "Dom", Sub: "Sub", Switcher: "Switcher", Bull: "Bull" };
            const singleData: PartnerData = {
              height_cm: p.height_cm,
              weight_kg: p.weight_kg,
              body_type: p.body_type ?? undefined,
              date_of_birth: p.date_of_birth ?? undefined,
              preferences: Array.isArray(p.preferences) ? p.preferences : [],
              experience_level: p.experience_level ?? undefined,
              about_me: p.about_me ?? undefined,
            };

            const renderPartnerCard = (data: PartnerData, label: string, cardAvatarUrl: string | null) => (
              <div key={label} className="flex h-full flex-col overflow-hidden border-b border-gray-700/60 pb-8">
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-700 bg-background sm:h-24 sm:w-24">
                      {cardAvatarUrl ? (
                        <img src={cardAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-gray-500">
                          <User className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} aria-hidden />
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <h3 className="text-base font-semibold text-white">{label}</h3>
                      {getAgeFromDateOfBirth(data.date_of_birth ?? null) != null && (
                        <p className="mt-0.5 text-sm text-gray-400">
                          {getAgeFromDateOfBirth(data.date_of_birth ?? null)} Jahre
                        </p>
                      )}
                      {profile.role && (
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                          <RoleIcon role={profile.role} size={18} className="text-accent" />
                          <span className="text-sm text-gray-300">{profile.role === "Switcher" && isCouple ? "Paar" : (roleLabels[profile.role] ?? profile.role)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border border-gray-700/60 bg-gray-900/40 px-4 py-3">
                    <dl className="mx-auto flex max-w-xs flex-col items-center space-y-2 text-center text-sm">
                      {data.height_cm != null && data.height_cm > 0 && (
                        <div className="flex w-full justify-center gap-4">
                          <dt className="text-gray-400">Größe</dt>
                          <dd className="text-white">{data.height_cm} cm</dd>
                        </div>
                      )}
                      {data.weight_kg != null && data.weight_kg > 0 && (
                        <div className="flex w-full justify-center gap-4">
                          <dt className="text-gray-400">Gewicht</dt>
                          <dd className="text-white">{data.weight_kg} kg</dd>
                        </div>
                      )}
                      {data.body_type && (
                        <div className="flex w-full justify-center gap-4">
                          <dt className="text-gray-400">Figur</dt>
                          <dd className="text-white">{data.body_type}</dd>
                        </div>
                      )}
                      {getExperienceLabel(data.experience_level ?? null) && (
                        <div className="flex w-full justify-center gap-4">
                          <dt className="text-gray-400">Erfahrung</dt>
                          <dd className="text-white">{getExperienceLabel(data.experience_level ?? null)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div className="min-h-[200px]">
                    {data.preferences && data.preferences.length > 0 ? (
                      <div className="mt-6 border-t border-gray-700 pt-4">
                        <h4 className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400">Vorlieben</h4>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          {data.preferences.map((pref) => (
                            <span key={pref} className="rounded-full bg-accent/20 px-3 py-1.5 text-sm text-accent">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 border-t border-gray-700 pt-4" />
                    )}
                  </div>
                  {data.about_me && (
                    <div className="mt-6">
                      <h4 className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400">Über mich</h4>
                      <p className="mx-auto mt-2 max-w-2xl whitespace-pre-wrap text-center text-sm leading-relaxed text-gray-300">{data.about_me}</p>
                    </div>
                  )}
                  {!data.height_cm && !data.weight_kg && !data.body_type && getAgeFromDateOfBirth(data.date_of_birth ?? null) == null && !getExperienceLabel(data.experience_level ?? null) && (!data.preferences || data.preferences.length === 0) && !data.about_me && (
                    <p className="mt-6 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">Keine Angaben</p>
                  )}
                </div>
              </div>
            );

            const infoAvatarUrl = viewerNoImages ? null : avatarUrl;
            return (
            <div className="space-y-6">
              <section className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
                <div className="space-y-8">
                {isCouple ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
                    {renderPartnerCard(left, leftLabel, leftAvatarUrlResolved ?? null)}
                    {renderPartnerCard(right, rightLabel, rightAvatarUrlResolved ?? null)}
                  </div>
                ) : (
                  renderPartnerCard(singleData, "Profil", infoAvatarUrl)
                )}
                </div>
              </section>
              {profile.role === "Bull" && (
                <section className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
                  <BullRatingsSection
                    bullId={profile.id}
                    ratings={bullRatings}
                    myRating={bullRatings.find((r) => r.rater_id === user.id) ?? null}
                    canSeeSection={
                      user.id === profile.id ||
                      myProfile?.account_type === "couple" ||
                      myProfile?.gender === "Frau"
                    }
                    canRate={
                      (myProfile?.account_type === "couple" || myProfile?.gender === "Frau") &&
                      !!myProfile?.verified
                    }
                    viewerVerified={!!myProfile?.verified}
                    isOwnProfile={user.id === profile.id}
                    raterNickById={bullRaterNickById}
                  />
                </section>
              )}
              </div>
            );
          })()}

          {tab === "alben" && (
            <ProfileAlbumsSection
              ownerId={profile.id}
              viewerId={user.id}
              albums={albumsWithCovers}
              requestStatusByAlbum={requestStatusByAlbum}
              ownerAvatarUrl={avatarUrl}
              isViewerVerified={myProfile?.verified ?? false}
              viewerNoImages={viewerNoImages}
            />
          )}
        </div>
      </div>
      </>
      )}
    </Container>
  );
}
