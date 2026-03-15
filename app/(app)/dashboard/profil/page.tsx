import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { getAgeFromDateOfBirth, getGenderSymbol, getExperienceLabel, getLookingForGenderDisplay } from "@/lib/profile-utils";
import { ProfileAlbumsSection } from "@/components/albums/ProfileAlbumsSection";
import { RoleIcon } from "@/components/RoleIcon";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { Pencil, Images, User } from "lucide-react";
import { PostDeleteButton } from "@/components/PostDeleteButton";
import { CouplePartnerAvatarPicker } from "@/components/profil/CouplePartnerAvatarPicker";

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
      "id, nick, role, gender, city, postal_code, avatar_url, avatar_photo_id, height_cm, weight_kg, body_type, date_of_birth, age_range, looking_for_gender, looking_for_genders, looking_for, preferences, expectations_text, about_me, experience_level, account_type, couple_type, couple_first_is, partner_date_of_birth, partner_height_cm, partner_weight_kg, partner_body_type, partner_about_me, partner_preferences, partner_experience_level, couple_female_avatar_photo_id, couple_male_avatar_photo_id"
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

  const baseUrl = "/dashboard/profil";

  return (
    <Container className="py-16">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Zurück zu MyBound
      </Link>

      {/* Header: eigenes Profil wie Profil-Detail */}
      <div className="relative overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card">
        <div className="flex flex-col items-center p-6 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-gray-700 bg-background shadow-lg sm:h-28 sm:w-28">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-accent sm:text-3xl">
                {initials}
              </span>
            )}
          </div>
          <div className="mt-4 sm:ml-6 sm:mt-0">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{profile.nick ?? "—"}</h1>
            <p className="mt-1 text-gray-400">
              {(profile as { account_type?: string }).account_type === "couple" ? (
                <span>Paarprofil</span>
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
              <p className="mt-1 text-sm text-gray-500">
                {[profile.postal_code, profile.city].filter(Boolean).join(" ")}
              </p>
            )}
          </div>
        </div>

        {/* Statistik-Zeile */}
        <div className="flex items-center justify-center gap-8 border-t border-gray-700 px-6 py-4 sm:justify-start">
          <span className="text-gray-400">
            <span className="font-semibold text-white">{followerCount ?? 0}</span> Follower
          </span>
          <span className="text-gray-400">
            <span className="font-semibold text-white">{followingCount ?? 0}</span> folgt
          </span>
        </div>

        {/* Aktionen: Profil bearbeiten, Meine Alben, ggf. Verifizierung */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-gray-700 px-6 py-4 sm:justify-start">
          <Link
            href="/dashboard/profil/bearbeiten"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Profil bearbeiten
          </Link>
          <Link
            href="/dashboard/alben"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:border-gray-500 hover:text-white"
          >
            <Images className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Meine Alben
          </Link>
          {!myProfile?.verified && (
            <Link
              href="/dashboard/verifizierung"
              className="rounded-lg border border-amber-600/50 px-4 py-2 text-sm text-amber-400 hover:border-amber-500 hover:bg-amber-950/30"
            >
              Verifizierung beantragen
            </Link>
          )}
        </div>
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
              <div key={label} className="overflow-hidden rounded-xl border border-gray-700 bg-card shadow-sm">
                <div className="flex flex-col p-5">
                  {slot && isOwner ? (
                    <CouplePartnerAvatarPicker
                      slot={slot}
                      currentImageUrl={cardAvatarUrl}
                      ownerId={profile.id}
                      label={label}
                      age={getAgeFromDateOfBirth(data.date_of_birth ?? null) ?? undefined}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-700 bg-background sm:h-24 sm:w-24">
                        {cardAvatarUrl ? (
                          <img src={cardAvatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-gray-500">
                            <User className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} aria-hidden />
                          </span>
                        )}
                      </div>
                      <div className="mt-3 sm:ml-4 sm:mt-0">
                        <h3 className="text-base font-semibold text-white">{label}</h3>
                        {getAgeFromDateOfBirth(data.date_of_birth ?? null) != null && (
                          <p className="mt-0.5 text-sm text-gray-400">
                            {getAgeFromDateOfBirth(data.date_of_birth ?? null)} Jahre
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 max-w-sm rounded-lg border border-gray-700/60 bg-gray-900/40 px-3 py-3">
                    <dl className="space-y-2">
                      {data.height_cm != null && data.height_cm > 0 && (
                        <div className="flex justify-between gap-4 text-sm">
                          <dt className="text-gray-400">Größe</dt>
                          <dd className="text-white">{data.height_cm} cm</dd>
                        </div>
                      )}
                      {data.weight_kg != null && data.weight_kg > 0 && (
                        <div className="flex justify-between gap-4 text-sm">
                          <dt className="text-gray-400">Gewicht</dt>
                          <dd className="text-white">{data.weight_kg} kg</dd>
                        </div>
                      )}
                      {data.body_type && (
                        <div className="flex justify-between gap-4 text-sm">
                          <dt className="text-gray-400">Figur</dt>
                          <dd className="text-white">{data.body_type}</dd>
                        </div>
                      )}
                      {getExperienceLabel(data.experience_level ?? null) && (
                        <div className="flex justify-between gap-4 text-sm">
                          <dt className="text-gray-400">Erfahrung</dt>
                          <dd className="text-white">{getExperienceLabel(data.experience_level ?? null)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  {profile.role && (
                    <div className="mt-3 flex items-center gap-1.5 border-t border-gray-700 pt-3">
                      <RoleIcon role={profile.role} size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-300">{profile.role === "Switcher" && isCouple ? "Paar" : (roleLabels[profile.role] ?? profile.role)}</span>
                    </div>
                  )}
                  {data.preferences && data.preferences.length > 0 && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Vorlieben</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {data.preferences.map((pref) => (
                          <span key={pref} className="rounded-full bg-accent/20 px-3 py-1 text-sm text-accent">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.about_me && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Über mich</h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">{data.about_me}</p>
                    </div>
                  )}
                  {!data.height_cm && !data.weight_kg && !data.body_type && getAgeFromDateOfBirth(data.date_of_birth ?? null) == null && !getExperienceLabel(data.experience_level ?? null) && (!data.preferences || data.preferences.length === 0) && !data.about_me && (
                    <p className="mt-4 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">Keine Angaben</p>
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
              {isCouple ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {renderPartnerCard(left, leftLabel, leftAvatarUrlResolved ?? null, isCoupleWomanMan ? (womanFirst ? "female" : "male") : undefined)}
                  {renderPartnerCard(right, rightLabel, rightAvatarUrlResolved ?? null, isCoupleWomanMan ? (womanFirst ? "male" : "female") : undefined)}
                </div>
              ) : (
                renderPartnerCard(singleData, "Profil", avatarUrl)
              )}

              {isCouple && (profile.city || profile.postal_code) && (
                <div className="rounded-xl border border-gray-700 bg-card/50 p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Ort</h2>
                  <p className="mt-2 text-white">{[profile.postal_code, profile.city].filter(Boolean).join(" ")}</p>
                </div>
              )}

              {((profile as { looking_for_genders?: string[] }).looking_for_genders?.length || profile.looking_for_gender) && (
                <div className="rounded-xl border border-gray-700 bg-card/50 p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    {isCouple ? "Wen sucht ihr?" : "Wen suchst du?"}
                  </h2>
                  <p className="mt-2 text-white">
                    {getLookingForGenderDisplay((profile as { looking_for_genders?: string[] }).looking_for_genders ?? profile.looking_for_gender)}
                  </p>
                </div>
              )}

              {Array.isArray(profile.looking_for) && profile.looking_for.length > 0 && (
                <div className="rounded-xl border border-gray-700 bg-card/50 p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    {isCouple ? "Was sucht ihr?" : "Was suchst du?"}
                  </h2>
                  <p className="mt-2 text-white">{profile.looking_for.join(", ")}</p>
                </div>
              )}

              {profile.expectations_text && (
                <div className="rounded-xl border border-gray-700 bg-card/50 p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    {isCouple ? "Was vom Gegenüber erwartet wird?" : "Was erwartest du von deinem Gesuchten?"}
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-gray-300">{profile.expectations_text}</p>
                </div>
              )}

              {isCouple && !(profile.city || profile.postal_code) && !(profile as { looking_for_genders?: string[] }).looking_for_genders?.length && !profile.looking_for_gender && !(Array.isArray(profile.looking_for) && profile.looking_for.length) && !profile.expectations_text && (
                <p className="text-sm text-gray-500">Noch keine weiteren Angaben hinterlegt.</p>
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
            />
          )}
        </div>
      </div>
    </Container>
  );
}
