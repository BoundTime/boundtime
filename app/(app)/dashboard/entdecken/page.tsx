import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { RoleIcon } from "@/components/RoleIcon";
import { EntdeckenFilterSection } from "@/components/EntdeckenFilterSection";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";

const KEYHOLDER_GESUCHT = "Keusch gehalten werden (Keyholderin/Keyholder suchen)";
const SUB_GESUCHT = "Keuschhalten anbieten (Keyholder)";

type SearchParams = { role?: string; gender?: string; plz_prefix?: string; preference?: string; experience?: string; keuschhaltung?: string };

export default async function EntdeckenPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const roleFilter = params.role && ["Dom", "Sub", "Switcher"].includes(params.role) ? params.role : null;
  const genderFilter = params.gender && ["Mann", "Frau", "Divers"].includes(params.gender) ? params.gender : null;
  const plzPrefix = params.plz_prefix?.replace(/\D/g, "").slice(0, 3) || null;
  const preferenceFilter = params.preference?.trim() || null;
  const experienceFilter = params.experience && ["beginner", "experienced", "advanced"].includes(params.experience) ? params.experience : null;
  const keuschhaltungFilter = params.keuschhaltung === "keyholder_gesucht" ? "keyholder_gesucht" : params.keuschhaltung === "sub_gesucht" ? "sub_gesucht" : null;

  const myProfile = await supabase
    .from("profiles")
    .select("postal_code")
    .eq("id", user.id)
    .single();

  const [{ data: iBlocked }, { data: blockedMe }] = await Promise.all([
    supabase.from("blocked_users").select("blocked_id").eq("blocker_id", user.id),
    supabase.from("blocked_users").select("blocker_id").eq("blocked_id", user.id),
  ]);
  const excludeIds = new Set([
    ...(iBlocked ?? []).map((r: { blocked_id: string }) => r.blocked_id),
    ...(blockedMe ?? []).map((r: { blocker_id: string }) => r.blocker_id),
  ]);

  let query = supabase
    .from("profiles")
    .select("id, nick, role, gender, city, postal_code, avatar_url, avatar_photo_id, looking_for, preferences, verified, experience_level, last_seen_at")
    .neq("id", user.id);

  if (excludeIds.size) query = query.not("id", "in", `(${Array.from(excludeIds).join(",")})`);
  if (roleFilter) query = query.eq("role", roleFilter);
  if (genderFilter) query = query.eq("gender", genderFilter);
  if (plzPrefix) query = query.like("postal_code", `${plzPrefix}%`);
  if (preferenceFilter) query = query.contains("preferences", [preferenceFilter]);
  if (experienceFilter) query = query.eq("experience_level", experienceFilter);
  if (keuschhaltungFilter === "keyholder_gesucht") query = query.contains("looking_for", [KEYHOLDER_GESUCHT]);
  if (keuschhaltungFilter === "sub_gesucht") query = query.contains("looking_for", [SUB_GESUCHT]);

  const { data: profilesRaw } = await query.order("nick");

  const profiles = await Promise.all(
    (profilesRaw ?? []).map(async (p) => {
      const avatarUrl = await resolveProfileAvatarUrl(
        { avatar_url: p.avatar_url, avatar_photo_id: p.avatar_photo_id },
        supabase
      );
      return { ...p, avatarUrl };
    })
  );

  const myPlzPrefix = myProfile.data?.postal_code?.slice(0, 2) ?? null;

  return (
    <Container className="py-16">
      <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Entdecken</h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
            ← Start
          </Link>
        </div>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-4 shadow-sm sm:p-6">
      <EntdeckenFilterSection
        roleFilter={roleFilter}
        genderFilter={genderFilter}
        experienceFilter={experienceFilter}
        preferenceFilter={preferenceFilter}
        plzPrefix={plzPrefix}
        myPlzPrefix={myPlzPrefix}
        keuschhaltungFilter={keuschhaltungFilter}
      />

        <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {profiles?.length ? (
            profiles.map((profile) => {
              const avatarUrl = (profile as { avatarUrl?: string | null }).avatarUrl ?? null;
              const initials = (profile.nick ?? "?")
                .split(/[\s_]+/)
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const isVerifiedDom = profile.verified && (profile.role === "Dom" || profile.role === "Switcher");
              const location = [profile.postal_code, profile.city].filter(Boolean).join(" ");
              return (
                <Link
                  key={profile.id}
                  href={`/dashboard/entdecken/${profile.id}`}
                  className={`flex flex-col overflow-hidden rounded-lg border bg-background/50 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                    isVerifiedDom ? "border-accent/60 hover:border-accent/80" : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-900">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-accent">
                        {initials}
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1">
                      <OnlineIndicator lastSeenAt={profile.last_seen_at} variant="dot" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 sm:p-1.5">
                    <p className="flex items-center gap-1.5 text-xs text-gray-300">
                      <RoleIcon role={profile.role} size={10} />
                      <span>{profile.role ?? "—"} · {profile.gender ?? "—"}</span>
                    </p>
                    {location && (
                      <p className="truncate text-xs text-gray-500">{location}</p>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="col-span-full rounded-xl border border-gray-700 bg-background/50 p-6 text-center text-sm text-gray-400">
              Keine Profile gefunden. Passe die Filter an oder schau später wieder vorbei.
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
