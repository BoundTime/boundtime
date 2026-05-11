import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { EntdeckenFilterSection } from "@/components/EntdeckenFilterSection";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { geocodeAddress, haversineKm, type AddressCountryCode } from "@/lib/geocode";
import { FilterBar } from "@/components/dashboard/entdecken/FilterBar";
import { ProfileCard } from "@/components/dashboard/entdecken/ProfileCard";
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
  verified?: string;
  view?: string;
  advanced?: string;
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
  const verifiedOnly = params.verified === "1";
  const viewMode = params.view === "list" ? "list" : "grid";
  const showAdvanced = params.advanced === "1";

  const filteredProfiles = verifiedOnly ? profiles.filter((p) => p.verified) : profiles;

  return (
    <Container className="py-6 md:py-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-white">Entdecken</h1>
        <p className="mt-1 text-sm text-gray-500">
          Profile durchsuchen – Filter nach Rolle, Nähe und Vorlieben.
        </p>
      </header>

      {/* Pill Filter Bar */}
      <FilterBar
        roleFilter={roleFilter}
        verifiedOnly={verifiedOnly}
        radiusKm={radiusKm}
        view={viewMode}
      />

      {/* Erweiterte Filter (ausklappbar) */}
      {showAdvanced && (
        <div className="mb-4">
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
        </div>
      )}

      {profilesError ? (
        <div className="rounded-lg border border-red-500/25 bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-200/90">Profile konnten nicht geladen werden.</p>
          <Link
            href="/dashboard/entdecken"
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-amber-400/35 bg-amber-950/30 px-5 py-2 text-sm text-amber-100 hover:bg-amber-950/45"
          >
            Erneut laden
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <section aria-label="Profile">
          {filteredProfiles.length > 0 ? (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
            >
              {filteredProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={{
                    id: profile.id,
                    nick: profile.nick,
                    role: profile.role,
                    city: profile.city,
                    postal_code: profile.postal_code,
                    verified: profile.verified,
                    last_seen_at: profile.last_seen_at,
                    avatarUrl: profile.avatarUrl ?? null,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-white/[0.08] bg-black/35 p-10 text-center">
              <p className="text-sm font-medium text-gray-200">Keine Profile mit diesen Kriterien</p>
              <p className="mt-2 text-sm text-gray-500">Filter lockern oder Umkreis vergrößern.</p>
              <Link
                href="/dashboard/entdecken"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-amber-400/35 bg-amber-950/25 px-5 py-2 text-sm text-amber-100 hover:bg-amber-950/40"
              >
                Alle Filter zurücksetzen
              </Link>
            </div>
          )}
        </section>
      ) : (
        /* Listenansicht */
        <section aria-label="Profile">
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5 lg:gap-6">
              {filteredProfiles.map((profile) => (
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
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-white/[0.08] bg-black/35 p-10 text-center">
              <p className="text-sm text-gray-200">Keine Profile gefunden.</p>
              <Link href="/dashboard/entdecken" className="mt-4 inline-block text-sm text-amber-200 hover:underline">
                Filter zurücksetzen
              </Link>
            </div>
          )}
        </section>
      )}
    </Container>
  );
}
