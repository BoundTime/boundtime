import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { RoleIcon } from "@/components/RoleIcon";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { EntdeckenFilterSection } from "@/components/EntdeckenFilterSection";

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

  let query = supabase
    .from("profiles")
    .select("id, nick, role, gender, city, postal_code, avatar_url, expectations_text, looking_for, preferences, verified, experience_level")
    .neq("id", user.id);

  if (roleFilter) query = query.eq("role", roleFilter);
  if (genderFilter) query = query.eq("gender", genderFilter);
  if (plzPrefix) query = query.like("postal_code", `${plzPrefix}%`);
  if (preferenceFilter) query = query.contains("preferences", [preferenceFilter]);
  if (experienceFilter) query = query.eq("experience_level", experienceFilter);
  if (keuschhaltungFilter === "keyholder_gesucht") query = query.contains("looking_for", [KEYHOLDER_GESUCHT]);
  if (keuschhaltungFilter === "sub_gesucht") query = query.contains("looking_for", [SUB_GESUCHT]);

  const { data: profiles } = await query.order("nick");

  const myPlzPrefix = myProfile.data?.postal_code?.slice(0, 2) ?? null;

  return (
    <Container className="py-16">
      <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Entdecken</h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
            ← Start
          </Link>
        </div>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
      <EntdeckenFilterSection
        roleFilter={roleFilter}
        genderFilter={genderFilter}
        experienceFilter={experienceFilter}
        preferenceFilter={preferenceFilter}
        plzPrefix={plzPrefix}
        myPlzPrefix={myPlzPrefix}
        keuschhaltungFilter={keuschhaltungFilter}
      />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {profiles?.length ? (
            profiles.map((profile) => {
              const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(profile.avatar_url ?? "");
              const avatarUrl = profile.avatar_url ? urlData.publicUrl : null;
              const initials = (profile.nick ?? "?")
                .split(/[\s_]+/)
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const lookingSnippet = Array.isArray(profile.looking_for) && profile.looking_for.length
                ? profile.looking_for.slice(0, 2).join(", ")
                : null;
              const prefSnippet = Array.isArray(profile.preferences) && profile.preferences.length
                ? profile.preferences.slice(0, 2)
                : [];

              const isVerifiedDom = profile.verified && (profile.role === "Dom" || profile.role === "Switcher");
              return (
                <Link
                  key={profile.id}
                  href={`/dashboard/entdecken/${profile.id}`}
                  className={`flex flex-col overflow-hidden rounded-lg border bg-background/50 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                    isVerifiedDom ? "border-accent/60 hover:border-accent/80" : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="relative h-28 w-full overflow-hidden bg-gray-900">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-accent sm:text-2xl">
                        {initials}
                      </span>
                    )}
                    {isVerifiedDom && (
                      <span className="absolute right-1.5 top-1.5 rounded bg-accent/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Verifiziert
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 p-2">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
                      <span className="truncate">{profile.nick ?? "—"}</span>
                      {profile.verified && <VerifiedBadge size={10} className="shrink-0" />}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <RoleIcon role={profile.role} size={12} />
                      <span>{profile.role ?? "—"} · {profile.gender ?? "—"}</span>
                      {isVerifiedDom && <span className="text-accent"> · Verifizierter Dom</span>}
                    </p>
                    {profile.experience_level && (
                      <p className="text-xs text-gray-500">
                        {profile.experience_level === "beginner" && "Einsteiger:in"}
                        {profile.experience_level === "experienced" && "Erfahren"}
                        {profile.experience_level === "advanced" && "Sehr erfahren"}
                      </p>
                    )}
                    {(profile.city || profile.postal_code) && (
                      <p className="text-xs text-gray-500">
                        {[profile.postal_code, profile.city].filter(Boolean).join(" ")}
                      </p>
                    )}
                    {prefSnippet.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {prefSnippet.map((p) => (
                          <span
                            key={p}
                            className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {(lookingSnippet || profile.expectations_text) && (
                      <p className="line-clamp-2 text-xs text-gray-500">
                        {lookingSnippet || (profile.expectations_text ?? "").slice(0, 80)}
                        {(profile.expectations_text?.length ?? 0) > 80 ? "…" : ""}
                      </p>
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
