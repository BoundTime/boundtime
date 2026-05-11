import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { getAgeFromDateOfBirth, getGenderSymbol, getExperienceLabel, getLookingForGenderDisplay, getOrientationLabel, getProfileProgress } from "@/lib/profile-utils";
import { ProfileAlbumsSection } from "@/components/albums/ProfileAlbumsSection";
import { RoleIcon } from "@/components/RoleIcon";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { Pencil, Images, User, BadgeCheck, Sparkles } from "lucide-react";
import { PostDeleteButton } from "@/components/PostDeleteButton";
import { CouplePartnerAvatarPicker } from "@/components/profil/CouplePartnerAvatarPicker";
import { ProfileViewsBlock } from "@/components/ProfileViewsBlock";
import { ProfileLikesBlock } from "@/components/ProfileLikesBlock";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { formatMemberSince } from "@/lib/member-since";

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

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
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
      "id, nick, role, gender, city, postal_code, current_postal_code, current_city, avatar_url, avatar_photo_id, height_cm, weight_kg, body_type, date_of_birth, age_range, looking_for_gender, looking_for_genders, looking_for, preferences, expectations_text, about_me, experience_level, account_type, couple_type, couple_first_is, partner_date_of_birth, partner_height_cm, partner_weight_kg, partner_body_type, partner_about_me, partner_preferences, partner_experience_level, couple_female_avatar_photo_id, couple_male_avatar_photo_id, orientation, created_at, last_seen_at"
    )
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const avatarUrl = await resolveProfileAvatarUrl(
    { avatar_url: profile.avatar_url, avatar_photo_id: profile.avatar_photo_id },
    supabase
  );

  const profileWithCoupleAvatars = profile as typeof profile & {
    couple_female_avatar_photo_id?: string | null;
    couple_male_avatar_photo_id?: string | null;
  };
  const [femaleAvatarUrl, maleAvatarUrl] = await Promise.all([
    resolveProfileAvatarUrl({ avatar_photo_id: profileWithCoupleAvatars.couple_female_avatar_photo_id ?? null }, supabase),
    resolveProfileAvatarUrl({ avatar_photo_id: profileWithCoupleAvatars.couple_male_avatar_photo_id ?? null }, supabase),
  ]);

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
  const lastSeenAt = (profile as { last_seen_at?: string | null }).last_seen_at ?? null;

  const { data: albums } = await supabase
    .from("photo_albums")
    .select("id, name, is_main")
    .eq("owner_id", profile.id);

  const albumIds = albums?.map((a) => a.id) ?? [];
  const requestStatusByAlbum: Record<string, "none" | "pending" | "approved" | "rejected"> = {};
  albumIds.forEach((aid) => {
    requestStatusByAlbum[aid] = "approved";
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

  const { data: recentProfileLikesRaw } = await supabase
    .from("profile_likes")
    .select("liker_id, liked_at")
    .eq("liked_id", profile.id)
    .order("liked_at", { ascending: false })
    .limit(4);
  const recentProfileLikes = (recentProfileLikesRaw ?? []) as { liker_id: string; liked_at: string }[];
  const likerIds = Array.from(new Set(recentProfileLikes.map((l) => l.liker_id)));
  const { data: recentLikerProfilesRaw } =
    likerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, nick, avatar_url, avatar_photo_id, verified")
          .in("id", likerIds)
      : { data: [] };
  const recentLikerProfiles = await Promise.all(
    ((recentLikerProfilesRaw ?? []) as Array<{
      id: string;
      nick: string | null;
      avatar_url: string | null;
      avatar_photo_id: string | null;
      verified: boolean | null;
    }>).map(async (p) => ({
      id: p.id,
      nick: p.nick,
      avatar_url: p.avatar_url,
      avatar_display_url: await resolveProfileAvatarUrl(
        { avatar_url: p.avatar_url, avatar_photo_id: p.avatar_photo_id },
        supabase
      ),
      verified: p.verified ?? false,
    }))
  );

  const baseUrl = "/dashboard/profil";

  // Tage gebunden für Stats-Leiste
  const { data: activeArrForStats } = await supabase
    .from("chastity_arrangements")
    .select("locked_at")
    .eq("sub_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  const daysBoundForStats = activeArrForStats?.locked_at
    ? Math.max(0, Math.floor((Date.now() - new Date(activeArrForStats.locked_at).getTime()) / 86400000))
    : 0;

  return (
    <Container className="py-6 md:py-8">
      {/* Cover + Profil-Header */}
      <div className="overflow-hidden rounded-2xl border border-white/10" style={{ background: "#141414" }}>
        {/* Cover Photo Area */}
        <div
          className="relative h-[90px] md:h-[160px]"
          style={{
            background: "linear-gradient(135deg, #1a0808, #2d0f0f)",
            backgroundImage: `linear-gradient(135deg, #1a0808, #2d0f0f), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(200,169,81,0.06) 10px, rgba(200,169,81,0.06) 11px)`,
          }}
        >
          {/* Diagonales Muster */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.06,
              backgroundImage: `repeating-linear-gradient(45deg, #C8A951 0px, #C8A951 1px, transparent 1px, transparent 14px)`,
            }}
          />
        </div>

        {/* Profil-Header */}
        <div className="relative border-b border-white/[0.06] px-5 pb-4" style={{ background: "#141414" }}>
          {/* Avatar (schwebend über Cover) — 56px auf Mobile, 80px auf Desktop */}
          <div className="absolute" style={{ top: -28, left: 16 }}>
            <div className="relative md:hidden">
              <div
                className="overflow-hidden rounded-full"
                style={{ width: 56, height: 56, border: "3px solid #141414", background: "#1a1a1a" }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-base font-semibold text-[#7B1111]">
                    {initials}
                  </span>
                )}
              </div>
              <span
                className="absolute bottom-0.5 right-0.5 rounded-full"
                style={{ width: 12, height: 12, background: "#22C55E", border: "2px solid #141414" }}
              />
            </div>
          </div>
          <div className="absolute hidden md:block" style={{ top: -40, left: 20 }}>
            <div className="relative">
              <div
                className="overflow-hidden rounded-full"
                style={{ width: 80, height: 80, border: "3px solid #141414", background: "#1a1a1a" }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-[#7B1111]">
                    {initials}
                  </span>
                )}
              </div>
              <span
                className="absolute bottom-0.5 right-0.5 rounded-full"
                style={{ width: 14, height: 14, background: "#22C55E", border: "2.5px solid #141414" }}
              />
            </div>
          </div>

          {/* Actions-Reihe */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <Link
              href="/dashboard/alben"
              className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] text-gray-300 hover:text-white transition-colors"
            >
              <Images className="h-3.5 w-3.5" />
              Alben
            </Link>
            <Link
              href="/dashboard/profil/bearbeiten"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "#7B1111" }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Profil bearbeiten
            </Link>
          </div>

          {/* Name-Reihe (Platz für schwebenden Avatar) */}
          <div className="mt-6 md:mt-[44px]">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-medium text-white">{profile.nick ?? "—"}</h1>
              {myProfile?.verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                  style={{ background: "rgba(91,168,255,0.1)", border: "1px solid rgba(91,168,255,0.3)", color: "#5BA8FF" }}
                >
                  <BadgeCheck className="h-3 w-3" />
                  Verifiziert
                </span>
              )}
              {roleLabel && (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: "rgba(123,17,17,0.1)", color: "#7B1111", border: "1px solid rgba(123,17,17,0.2)" }}
                >
                  {roleLabel}
                </span>
              )}
            </div>

            {/* Meta-Zeile */}
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {(profile.city || profile.postal_code) && (
                <span className="flex items-center gap-1 text-[12px] text-gray-500">
                  📍 {[profile.postal_code, profile.city].filter(Boolean).join(" ")}
                </span>
              )}
              {getAgeFromDateOfBirth(profile.date_of_birth) != null && (
                <span className="text-[12px] text-gray-500">
                  📅 {getAgeFromDateOfBirth(profile.date_of_birth)} Jahre
                </span>
              )}
              {memberSinceLabel && (
                <span className="text-[12px] text-gray-500">
                  🕐 {memberSinceLabel}
                </span>
              )}
              <OnlineIndicator lastSeenAt={lastSeenAt} variant="text" />
            </div>
          </div>

          {/* Statistik-Leiste */}
          <div className="mt-4 flex overflow-x-auto overflow-hidden rounded-md border border-white/[0.06] max-w-full">
            <Link
              href="/dashboard/profil/follower"
              className="flex flex-col items-center px-4 py-2 hover:bg-white/[0.04] transition-colors border-r border-white/[0.06]"
            >
              <span className="text-[15px] font-medium text-white">{followerCount ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">Follower</span>
            </Link>
            <Link
              href="/dashboard/profil/folgt"
              className="flex flex-col items-center px-4 py-2 hover:bg-white/[0.04] transition-colors border-r border-white/[0.06]"
            >
              <span className="text-[15px] font-medium text-white">{followingCount ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">Folgt</span>
            </Link>
            <Link
              href="/dashboard/aktivitaet/besucher"
              className="flex flex-col items-center px-4 py-2 hover:bg-white/[0.04] transition-colors border-r border-white/[0.06]"
            >
              <span className="text-[15px] font-medium text-white">—</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">Besucher</span>
            </Link>
            {daysBoundForStats > 0 && (
              <div className="flex flex-col items-center px-4 py-2">
                <span className="text-[15px] font-medium" style={{ color: "#7B1111" }}>{daysBoundForStats}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">Tage Bound</span>
              </div>
            )}
          </div>

          {!myProfile?.verified && (
            <div className="mt-3">
              <Link
                href="/dashboard/verifizierung"
                className="inline-flex rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-[12px] text-amber-200 transition-colors hover:bg-amber-500/20"
              >
                Verifizierung beantragen
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding-Karte für unvollständige Profile */}
      {(() => {
        const progress = getProfileProgress(profile as Record<string, unknown>);
        if (progress >= 50) return null;
        return (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-950/20 p-5">
            <h2 className="text-sm font-semibold text-amber-100">Profil vervollständigen – {progress} % fertig</h2>
            <p className="mt-1 text-xs text-gray-400">
              Je vollständiger dein Profil, desto mehr Verbindungen findest du in der Community.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs">
              {!(profile.avatar_url || profile.avatar_photo_id) && (
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  <span><Link href="/dashboard/alben" className="text-accent hover:underline">Profilbild hochladen</Link> – Alben → Hauptalbum → Foto hochladen → „Als Profilbild"</span>
                </li>
              )}
              {!(profile.postal_code || profile.city) && (
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  <span><Link href="/dashboard/profil/bearbeiten" className="text-accent hover:underline">Wohnort ergänzen</Link> – für die Suche „in der Nähe"</span>
                </li>
              )}
              {!(profile as { looking_for?: unknown }).looking_for && (
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  <span><Link href="/dashboard/profil/bearbeiten" className="text-accent hover:underline">Suche ausfüllen</Link> – wen und was suchst du?</span>
                </li>
              )}
              {!profile.about_me && (
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  <span><Link href="/dashboard/profil/bearbeiten" className="text-accent hover:underline">Über mich schreiben</Link></span>
                </li>
              )}
            </ul>
            <Link
              href="/dashboard/profil/bearbeiten"
              className="mt-4 inline-block rounded-xl border border-amber-400/40 bg-amber-950/40 px-4 py-2 text-xs font-semibold text-amber-50 transition-colors hover:bg-amber-950/60"
            >
              Profil bearbeiten →
            </Link>
          </div>
        );
      })()}

      <div className="mt-6 rounded-2xl border border-white/10 bg-card/95 shadow-sm">
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
                      id={`post-${post.id}`}
                      className="scroll-mt-4 overflow-hidden rounded-xl border border-gray-700 bg-background/50"
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
                        <div className="mt-3 flex items-center">
                          <PostDeleteButton postId={post.id} imageUrl={post.image_url} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-gray-500">
                  Du hast noch keine Posts.
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
            const leftAvatarUrlResolved = isCoupleWomanMan ? (womanFirst ? femaleAvatarUrl : maleAvatarUrl) : avatarUrl;
            const rightAvatarUrlResolved = isCoupleWomanMan ? (womanFirst ? maleAvatarUrl : femaleAvatarUrl) : avatarUrl;

            const isOwner = true;
            const renderPartnerCard = (data: PartnerData, label: string, cardAvatarUrl: string | null, slot?: "female" | "male") => (
              <div key={label} className="flex h-full flex-col overflow-hidden border-b border-gray-700/60 pb-8">
                <div className="flex flex-1 flex-col">
                  {slot && isOwner ? (
                    <CouplePartnerAvatarPicker
                      slot={slot}
                      currentImageUrl={cardAvatarUrl}
                      ownerId={profile.id}
                      label={label}
                      age={getAgeFromDateOfBirth(data.date_of_birth ?? null) ?? undefined}
                    />
                  ) : (
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
                  )}
                  {profile.role && slot && isOwner && (
                    <div className="mt-2 flex justify-center gap-1.5">
                      <RoleIcon role={profile.role} size={18} className="text-accent" />
                      <span className="text-sm text-gray-300">{profile.role === "Switcher" && isCouple ? "Paar" : (roleLabels[profile.role] ?? profile.role)}</span>
                    </div>
                  )}
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

            const singleData: PartnerData = {
              height_cm: p.height_cm,
              weight_kg: p.weight_kg,
              body_type: p.body_type ?? undefined,
              date_of_birth: p.date_of_birth ?? undefined,
              preferences: Array.isArray(p.preferences) ? p.preferences : [],
              experience_level: p.experience_level ?? undefined,
              about_me: p.about_me ?? undefined,
            };

            return (
            <div className="space-y-6">
              <section className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-300">Interaktion</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Relevante Rückmeldungen zu deinem Profil auf einen Blick.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ProfileViewsBlock embeddedInLink />
                  <ProfileLikesBlock likes={recentProfileLikes} profiles={recentLikerProfiles} embeddedInLink />
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
                <div className="space-y-8">
                {isCouple ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
                    {renderPartnerCard(left, leftLabel, leftAvatarUrlResolved ?? null, isCoupleWomanMan ? (womanFirst ? "female" : "male") : undefined)}
                    {renderPartnerCard(right, rightLabel, rightAvatarUrlResolved ?? null, isCoupleWomanMan ? (womanFirst ? "male" : "female") : undefined)}
                  </div>
                ) : (
                  renderPartnerCard(singleData, "Profil", avatarUrl)
                )}
                </div>
              </section>

              {/* Suche & Neigung (auch auf eigenem Profil sichtbar) */}
              {(() => {
                const lfg = (p as { looking_for_genders?: string[] }).looking_for_genders;
                const lf = (p as { looking_for?: string[] | null }).looking_for;
                const orient = (p as { orientation?: string | null }).orientation;
                const expText = (p as { expectations_text?: string | null }).expectations_text;
                const hasAny = orient || (Array.isArray(lfg) && lfg.length > 0) || (Array.isArray(lf) && lf.length > 0) || (expText && String(expText).trim());
                if (!hasAny) return (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-gray-500">
                    Noch keine Suche & Neigung angegeben.{" "}
                    <a href="/dashboard/profil/bearbeiten" className="text-accent hover:underline">Jetzt ergänzen →</a>
                  </div>
                );
                return (
                  <section className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Suche &amp; Neigung</h4>
                    <dl className="space-y-4 text-sm">
                      {orient && (
                        <div className="flex gap-3">
                          <dt className="w-28 shrink-0 text-gray-400">Neigung</dt>
                          <dd className="text-white">{getOrientationLabel(orient)}</dd>
                        </div>
                      )}
                      {Array.isArray(lfg) && lfg.length > 0 && (
                        <div className="flex gap-3">
                          <dt className="w-28 shrink-0 text-gray-400">Wen gesucht</dt>
                          <dd className="text-white">{lfg.join(", ")}</dd>
                        </div>
                      )}
                      {Array.isArray(lf) && lf.length > 0 && (
                        <div>
                          <dt className="mb-2 text-gray-400">Was gesucht</dt>
                          <dd className="flex flex-wrap gap-2">
                            {lf.map((item) => (
                              <span key={item} className="rounded-full bg-accent/20 px-3 py-1 text-sm text-accent">{item}</span>
                            ))}
                          </dd>
                        </div>
                      )}
                      {expText && String(expText).trim() && (
                        <div>
                          <dt className="mb-1 text-gray-400">Erwartungen</dt>
                          <dd className="whitespace-pre-wrap leading-relaxed text-gray-300">{String(expText).trim()}</dd>
                        </div>
                      )}
                    </dl>
                    <a href="/dashboard/profil/bearbeiten" className="mt-4 inline-block text-xs text-gray-500 hover:text-accent hover:underline">bearbeiten →</a>
                  </section>
                );
              })()}

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
            />
          )}
        </div>
      </div>
    </Container>
  );
}
