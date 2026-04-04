import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { EntdeckenFilterSection } from "@/components/EntdeckenFilterSection";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { geocodeAddress, haversineKm, type AddressCountryCode } from "@/lib/geocode";
import { DiscoverProfileCard } from "@/components/entdecken/DiscoverProfileCard";

const KEYHOLDER_GESUCHT = "Keusch gehalten werden (Keyholderin/Keyholder suchen)";
const SUB_GESUCHT = "Keuschhalten anbieten (Keyholder)";

type SearchParams = {
  role?: string;
  gender?: string;
  account_type?: string;
  plz_prefix?: string;
  loc_country?: string;
  preference?: string;
  experience?: string;
  keuschhaltung?: string;
  radius_km?: string;
  radius_center?: string;
};

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
  const roleFilter = params.role && ["Dom", "Sub", "Switcher", "Bull"].includes(params.role) ? params.role : null;
  const genderFilter = params.gender && ["Mann", "Frau", "Divers"].includes(params.gender) ? params.gender : null;
  const accountTypeFilter =
    params.account_type === "couple" ? "couple" : params.account_type === "single" ? "single" : null;
  const plzPrefix = params.plz_prefix?.replace(/\D/g, "").slice(0, 5) || null;
  const locCountryParam =
    params.loc_country === "AT" || params.loc_country === "CH" || params.loc_country === "DE"
      ? params.loc_country
      : null;
  const radiusKmParam = params.radius_km?.replace(/\D/g, "");
  const radiusKm = radiusKmParam ? Math.min(500, Math.max(1, parseInt(radiusKmParam, 10))) : null;
  const radiusCenter = params.radius_center?.trim() || null;
  const preferenceFilter = params.preference?.trim() || null;
  const experienceFilter =
    params.experience && ["beginner", "experienced", "advanced"].includes(params.experience)
      ? params.experience
      : null;
  const keuschhaltungFilter =
    params.keuschhaltung === "keyholder_gesucht"
      ? "keyholder_gesucht"
      : params.keuschhaltung === "sub_gesucht"
        ? "sub_gesucht"
        : null;

  const myProfile = await supabase
    .from("profiles")
    .select(
      "postal_code, address_country, account_type, restriction_enabled, restriction_no_single_female_profiles, restriction_no_couple_profiles, restriction_no_images"
    )
    .eq("id", user.id)
    .single();

  const defaultLocCountry: AddressCountryCode =
    myProfile.data?.address_country === "AT" || myProfile.data?.address_country === "CH"
      ? myProfile.data.address_country
      : "DE";
  const locCountryFilter: AddressCountryCode = locCountryParam ?? defaultLocCountry;

  const [{ data: iBlocked }, { data: blockedMe }] = await Promise.all([
    supabase.from("blocked_users").select("blocked_id").eq("blocker_id", user.id),
    supabase.from("blocked_users").select("blocker_id").eq("blocked_id", user.id),
  ]);
  const excludeIds = new Set([
    ...(iBlocked ?? []).map((r: { blocked_id: string }) => r.blocked_id),
    ...(blockedMe ?? []).map((r: { blocker_id: string }) => r.blocker_id),
  ]);

  const selectWithCoords =
    "id, nick, role, gender, city, postal_code, avatar_url, avatar_photo_id, looking_for, preferences, verified, experience_level, last_seen_at, account_type, latitude, longitude";
  let query = supabase.from("profiles").select(selectWithCoords).neq("id", user.id);

  if (excludeIds.size) query = query.not("id", "in", `(${Array.from(excludeIds).join(",")})`);
  if (roleFilter) query = query.eq("role", roleFilter);
  if (genderFilter) query = query.eq("gender", genderFilter);
  if (accountTypeFilter) query = query.eq("account_type", accountTypeFilter);
  if (plzPrefix && !radiusKm) {
    query = query.like("postal_code", `${plzPrefix}%`).eq("address_country", locCountryFilter);
  }
  if (radiusKm) query = query.not("latitude", "is", null).not("longitude", "is", null);
  if (preferenceFilter) query = query.contains("preferences", [preferenceFilter]);
  if (experienceFilter) query = query.eq("experience_level", experienceFilter);
  if (keuschhaltungFilter === "keyholder_gesucht") query = query.contains("looking_for", [KEYHOLDER_GESUCHT]);
  if (keuschhaltungFilter === "sub_gesucht") query = query.contains("looking_for", [SUB_GESUCHT]);

  let { data: profilesRaw, error: profilesError } = await query.order("nick");

  if (!profilesError && radiusKm != null && profilesRaw && profilesRaw.length > 0) {
    const centerQuery = (radiusCenter || plzPrefix || "").trim();
    const isPlz = /^\d{1,5}$/.test(centerQuery);
    const coords = await geocodeAddress(
      isPlz ? centerQuery : null,
      isPlz ? null : centerQuery || null,
      locCountryFilter
    );
    if (coords) {
      profilesRaw = profilesRaw.filter((p: { latitude?: number | null; longitude?: number | null }) => {
        if (p.latitude == null || p.longitude == null) return false;
        return haversineKm(coords.lat, coords.lon, p.latitude, p.longitude) <= radiusKm;
      });
    }
  }

  const isRestrictedViewer =
    myProfile.data?.account_type === "couple" && myProfile.data?.restriction_enabled === true;
  const noSingleFemale = isRestrictedViewer && myProfile.data?.restriction_no_single_female_profiles === true;
  const noCouple = isRestrictedViewer && myProfile.data?.restriction_no_couple_profiles === true;
  const noImages = isRestrictedViewer && myProfile.data?.restriction_no_images === true;

  let filteredRaw = profilesError ? [] : (profilesRaw ?? []);
  if (!profilesError && (noSingleFemale || noCouple)) {
    filteredRaw = filteredRaw.filter((p: { account_type?: string; gender?: string }) => {
      if (noSingleFemale && p.account_type === "single" && p.gender === "Frau") return false;
      if (noCouple && p.account_type === "couple") return false;
      return true;
    });
  }

  const profiles = profilesError
    ? []
    : await Promise.all(
        filteredRaw.map(async (p) => {
          const avatarUrl = noImages
            ? null
            : await resolveProfileAvatarUrl(
                { avatar_url: p.avatar_url, avatar_photo_id: p.avatar_photo_id },
                supabase
              );
          return { ...p, avatarUrl };
        })
      );

  const myPlzPrefix = myProfile.data?.postal_code?.slice(0, 2) ?? null;

  return (
    <Container className="relative py-10 md:py-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(420px,55vh)] opacity-[0.04] mix-blend-overlay md:h-[min(480px,50vh)]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.65'/%3E%3C/svg%3E")`,
        }}
      />

      <header className="relative mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/55 md:text-[11px]">
          BoundTime · Entdecken
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Entdecken</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400 md:text-[15px]">
              Profile durchsuchen – unabhängig vom Feed. Filter nach Rolle, Nähe und Vorlieben, dann öffne ein Profil für
              Details.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-gray-200 transition-[border-color,background-color,color] duration-200 hover:border-white/22 hover:bg-white/[0.07] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:self-auto"
          >
            <ChevronLeft className="h-4 w-4 text-amber-200/70" strokeWidth={1.75} aria-hidden />
            MyBound
          </Link>
        </div>
        <div
          className="mt-6 h-px w-full max-w-md bg-gradient-to-r from-amber-400/35 via-amber-200/15 to-transparent"
          aria-hidden
        />
      </header>

      <div className="relative">
        <EntdeckenFilterSection
          roleFilter={roleFilter}
          genderFilter={genderFilter}
          accountTypeFilter={accountTypeFilter}
          experienceFilter={experienceFilter}
          preferenceFilter={preferenceFilter}
          plzPrefix={plzPrefix}
          locCountryFilter={locCountryFilter}
          myPlzPrefix={myPlzPrefix}
          myAddressCountry={defaultLocCountry}
          keuschhaltungFilter={keuschhaltungFilter}
          radiusKm={radiusKm}
          radiusCenter={radiusCenter}
        />

        {profilesError ? (
          <div className="rounded-[1.15rem] border border-red-500/25 bg-red-950/20 p-8 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-red-200/90">Profile konnten nicht geladen werden.</p>
            <p className="mt-2 text-xs text-gray-400">Bitte versuche es in einem Moment erneut.</p>
            <Link
              href="/dashboard/entdecken"
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-400/35 bg-amber-950/30 px-5 text-sm font-medium text-amber-100 transition-colors hover:border-amber-300/50 hover:bg-amber-950/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45"
            >
              Erneut laden
            </Link>
          </div>
        ) : (
          <section aria-label="Profile" className="mt-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5 lg:gap-6">
              {profiles.length ? (
                profiles.map((profile) => (
                  <DiscoverProfileCard
                    key={profile.id}
                    profile={{
                      id: profile.id,
                      nick: profile.nick,
                      role: profile.role,
                      gender: profile.gender,
                      account_type: profile.account_type,
                      postal_code: profile.postal_code,
                      city: profile.city,
                      verified: profile.verified,
                      last_seen_at: profile.last_seen_at,
                      avatarUrl: profile.avatarUrl ?? null,
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <div className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.08] bg-black/35 p-8 text-center shadow-[0_24px_50px_-40px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-10">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
                      }}
                      aria-hidden
                    />
                    <p className="relative text-sm font-medium text-gray-200">Keine Profile mit diesen Kriterien</p>
                    <p className="relative mt-2 text-sm text-gray-500">
                      Filter lockern, Umkreis vergrößern oder später erneut schauen.
                    </p>
                    <Link
                      href="/dashboard/entdecken"
                      className="relative mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-400/35 bg-amber-950/25 px-5 text-sm font-medium text-amber-100 transition-[border-color,background-color] hover:border-amber-300/50 hover:bg-amber-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45"
                    >
                      Alle Filter zurücksetzen
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
