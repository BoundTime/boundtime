"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PREFERENCES_OPTIONS } from "@/types";

type LocCountry = "DE" | "AT" | "CH";

type Props = {
  roleFilter: string | null;
  genderFilter: string | null;
  accountTypeFilter: "single" | "couple" | null;
  experienceFilter: string | null;
  preferenceFilter: string | null;
  plzPrefix: string | null;
  /** Land für PLZ-Präfixfilter (vermeidet Kollisionen DE/AT/CH) */
  locCountryFilter: LocCountry;
  myPlzPrefix: string | null;
  myAddressCountry: LocCountry;
  keuschhaltungFilter: "keyholder_gesucht" | "sub_gesucht" | null;
  radiusKm: number | null;
  radiusCenter: string | null;
};

const fieldClass =
  "w-full rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-gray-500 focus:border-amber-400/35 focus:outline-none focus:ring-2 focus:ring-amber-400/20";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/50";

function buildSearchHref(props: Props, omitKeys: Set<string>): string {
  const p = new URLSearchParams();
  if (props.roleFilter && !omitKeys.has("role")) p.set("role", props.roleFilter);
  if (props.genderFilter && !omitKeys.has("gender")) p.set("gender", props.genderFilter);
  if (props.accountTypeFilter && !omitKeys.has("account_type")) p.set("account_type", props.accountTypeFilter);
  if (props.experienceFilter && !omitKeys.has("experience")) p.set("experience", props.experienceFilter);
  if (props.preferenceFilter && !omitKeys.has("preference")) p.set("preference", props.preferenceFilter);
  if (props.plzPrefix && !omitKeys.has("plz_prefix")) p.set("plz_prefix", props.plzPrefix);
  if (props.locCountryFilter && !omitKeys.has("loc_country")) p.set("loc_country", props.locCountryFilter);
  if (props.keuschhaltungFilter && !omitKeys.has("keuschhaltung")) p.set("keuschhaltung", props.keuschhaltungFilter);
  if (props.radiusKm != null && !omitKeys.has("radius_km")) p.set("radius_km", String(props.radiusKm));
  if (props.radiusCenter && !omitKeys.has("radius_center")) p.set("radius_center", props.radiusCenter);
  const s = p.toString();
  return s ? `/dashboard/entdecken?${s}` : "/dashboard/entdecken";
}

const experienceLabels: Record<string, string> = {
  beginner: "Einsteiger:in",
  experienced: "Erfahren",
  advanced: "Sehr erfahren",
};

const keuschLabels: Record<string, string> = {
  keyholder_gesucht: "Keyholder gesucht",
  sub_gesucht: "Sub gesucht",
};

export function EntdeckenFilterSection({
  roleFilter,
  genderFilter,
  accountTypeFilter,
  experienceFilter,
  preferenceFilter,
  plzPrefix,
  locCountryFilter,
  myPlzPrefix,
  myAddressCountry,
  keuschhaltungFilter,
  radiusKm,
  radiusCenter,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const propsBag = useMemo(
    (): Props => ({
      roleFilter,
      genderFilter,
      accountTypeFilter,
      experienceFilter,
      preferenceFilter,
      plzPrefix,
      locCountryFilter,
      myPlzPrefix,
      myAddressCountry,
      keuschhaltungFilter,
      radiusKm,
      radiusCenter,
    }),
    [
      roleFilter,
      genderFilter,
      accountTypeFilter,
      experienceFilter,
      preferenceFilter,
      plzPrefix,
      locCountryFilter,
      myPlzPrefix,
      myAddressCountry,
      keuschhaltungFilter,
      radiusKm,
      radiusCenter,
    ]
  );

  const activeChips = useMemo(() => {
    const chips: { label: string; omit: Set<string> }[] = [];
    if (roleFilter) chips.push({ label: `Rolle: ${roleFilter}`, omit: new Set(["role"]) });
    if (genderFilter) chips.push({ label: `Geschlecht: ${genderFilter}`, omit: new Set(["gender"]) });
    if (accountTypeFilter)
      chips.push({
        label: `Profiltyp: ${accountTypeFilter === "couple" ? "Paar" : "Einzel"}`,
        omit: new Set(["account_type"]),
      });
    if (experienceFilter)
      chips.push({
        label: `Erfahrung: ${experienceLabels[experienceFilter] ?? experienceFilter}`,
        omit: new Set(["experience"]),
      });
    if (preferenceFilter) {
      const short =
        preferenceFilter.length > 32 ? `${preferenceFilter.slice(0, 30)}…` : preferenceFilter;
      chips.push({ label: `Vorliebe: ${short}`, omit: new Set(["preference"]) });
    }
    if (plzPrefix) {
      const land =
        locCountryFilter === "DE"
          ? "Deutschland"
          : locCountryFilter === "AT"
            ? "Österreich"
            : "Schweiz";
      chips.push({ label: `PLZ: ${plzPrefix} · ${land}`, omit: new Set(["plz_prefix", "loc_country"]) });
    }
    if (keuschhaltungFilter)
      chips.push({
        label: `Keuschhaltung: ${keuschLabels[keuschhaltungFilter] ?? keuschhaltungFilter}`,
        omit: new Set(["keuschhaltung"]),
      });
    if (radiusKm != null) {
      const loc = radiusCenter?.trim();
      chips.push({
        label: loc ? `Umkreis: ${radiusKm} km · ${loc.length > 18 ? `${loc.slice(0, 16)}…` : loc}` : `Umkreis: ${radiusKm} km`,
        omit: new Set(["radius_km", "radius_center"]),
      });
    } else if (radiusCenter?.trim()) {
      chips.push({
        label: `Zentrum: ${radiusCenter.trim().length > 24 ? `${radiusCenter.trim().slice(0, 22)}…` : radiusCenter.trim()}`,
        omit: new Set(["radius_center"]),
      });
    }
    return chips;
  }, [
    roleFilter,
    genderFilter,
    accountTypeFilter,
    experienceFilter,
    preferenceFilter,
    plzPrefix,
    locCountryFilter,
    keuschhaltungFilter,
    radiusKm,
    radiusCenter,
  ]);

  const filterPanelInner = (idSuffix: "desktop" | "mobile") => (
    <form
      method="get"
      action="/dashboard/entdecken"
      className={idSuffix === "mobile" ? "flex flex-col gap-4" : "flex flex-col gap-5"}
      onSubmit={() => setMobileOpen(false)}
    >
      <div
        className={
          idSuffix === "mobile"
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        }
      >
        <div>
          <label htmlFor={`role-${idSuffix}`} className={labelClass}>
            Rolle
          </label>
          <select
            id={`role-${idSuffix}`}
            name="role"
            defaultValue={roleFilter ?? ""}
            className={fieldClass}
          >
            <option value="">Alle</option>
            <option value="Dom">Dom</option>
            <option value="Sub">Sub</option>
            <option value="Switcher">Switcher</option>
            <option value="Bull">Bull</option>
          </select>
        </div>
        <div>
          <label htmlFor={`gender-${idSuffix}`} className={labelClass}>
            Geschlecht
          </label>
          <select
            id={`gender-${idSuffix}`}
            name="gender"
            defaultValue={genderFilter ?? ""}
            className={fieldClass}
          >
            <option value="">Alle</option>
            <option value="Mann">Mann</option>
            <option value="Frau">Frau</option>
            <option value="Divers">Divers</option>
          </select>
        </div>
        <div>
          <label htmlFor={`account_type-${idSuffix}`} className={labelClass}>
            Profiltyp
          </label>
          <select
            id={`account_type-${idSuffix}`}
            name="account_type"
            defaultValue={accountTypeFilter ?? ""}
            className={fieldClass}
          >
            <option value="">Alle</option>
            <option value="single">Einzel</option>
            <option value="couple">Paar</option>
          </select>
        </div>
        <div>
          <label htmlFor={`experience-${idSuffix}`} className={labelClass}>
            Erfahrung
          </label>
          <select
            id={`experience-${idSuffix}`}
            name="experience"
            defaultValue={experienceFilter ?? ""}
            className={fieldClass}
          >
            <option value="">Alle</option>
            <option value="beginner">Einsteiger:in</option>
            <option value="experienced">Erfahren</option>
            <option value="advanced">Sehr erfahren</option>
          </select>
        </div>
        <div>
          <label htmlFor={`keuschhaltung-${idSuffix}`} className={labelClass}>
            Keuschhaltung
          </label>
          <select
            id={`keuschhaltung-${idSuffix}`}
            name="keuschhaltung"
            defaultValue={keuschhaltungFilter ?? ""}
            className={fieldClass}
          >
            <option value="">Alle</option>
            <option value="keyholder_gesucht">Keyholder gesucht</option>
            <option value="sub_gesucht">Sub gesucht</option>
          </select>
        </div>
        <div className={idSuffix === "mobile" ? "" : "xl:col-span-2"}>
          <label htmlFor={`preference-${idSuffix}`} className={labelClass}>
            Vorliebe
          </label>
          <select
            id={`preference-${idSuffix}`}
            name="preference"
            defaultValue={preferenceFilter ?? ""}
            className={fieldClass}
          >
            <option value="">Alle</option>
            {PREFERENCES_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`loc_country-${idSuffix}`} className={labelClass}>
            Land (PLZ-Filter)
          </label>
          <select
            id={`loc_country-${idSuffix}`}
            name="loc_country"
            defaultValue={locCountryFilter}
            className={fieldClass}
          >
            <option value="DE">Deutschland</option>
            <option value="AT">Österreich</option>
            <option value="CH">Schweiz</option>
          </select>
        </div>
        <div>
          <label htmlFor={`plz_prefix-${idSuffix}`} className={labelClass}>
            PLZ
          </label>
          <input
            id={`plz_prefix-${idSuffix}`}
            name="plz_prefix"
            type="text"
            inputMode="numeric"
            maxLength={5}
            defaultValue={plzPrefix ?? ""}
            placeholder="z. B. 80 oder 80331"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`radius_km-${idSuffix}`} className={labelClass}>
            Suchradius (km)
          </label>
          <input
            id={`radius_km-${idSuffix}`}
            name="radius_km"
            type="number"
            min={1}
            max={500}
            defaultValue={radiusKm ?? ""}
            placeholder="z. B. 20"
            className={`${fieldClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          />
        </div>
        <div className={idSuffix === "mobile" ? "" : "xl:col-span-2"}>
          <label htmlFor={`radius_center-${idSuffix}`} className={labelClass}>
            Ort / PLZ (Zentrum)
          </label>
          <input
            id={`radius_center-${idSuffix}`}
            name="radius_center"
            type="text"
            defaultValue={radiusCenter ?? ""}
            placeholder="für Umkreissuche"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-4 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-400/40 bg-amber-950/35 px-5 py-2.5 text-sm font-medium text-amber-50 shadow-[0_12px_32px_-20px_rgba(180,140,60,0.35)] transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out hover:border-amber-300/55 hover:bg-amber-950/50 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] motion-reduce:hover:translate-y-0"
        >
          Anwenden
        </button>
        <Link
          href="/dashboard/entdecken"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-gray-200 transition-[border-color,background-color,color] duration-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]"
          onClick={() => setMobileOpen(false)}
        >
          Zurücksetzen
        </Link>
        {myPlzPrefix && (
          <Link
            href={`/dashboard/entdecken?plz_prefix=${encodeURIComponent(myPlzPrefix)}&loc_country=${encodeURIComponent(myAddressCountry)}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-400 transition-colors duration-200 hover:border-white/18 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]"
            onClick={() => setMobileOpen(false)}
          >
            Meine Umgebung
          </Link>
        )}
      </div>
    </form>
  );

  const panelChrome = (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_0%_0%,rgba(180,140,60,0.1),transparent_55%),linear-gradient(168deg,rgba(18,16,15,0.92)_0%,rgba(6,6,8,0.96)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
    </>
  );

  return (
    <>
      {activeChips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="mr-1 self-center text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/45">
            Aktiv
          </span>
          {activeChips.map((chip) => (
            <Link
              key={`${Array.from(chip.omit).sort().join("-")}-${chip.label}`}
              href={buildSearchHref(propsBag, chip.omit)}
              className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-950/25 py-1 pl-3 pr-2 text-xs text-amber-100/90 transition-[border-color,background-color] hover:border-amber-300/45 hover:bg-amber-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45"
            >
              <span className="min-w-0 truncate">{chip.label}</span>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-gray-400 transition-colors group-hover:border-white/20 group-hover:text-white"
                aria-hidden
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="relative mb-8 hidden overflow-hidden rounded-[1.2rem] border border-amber-200/[0.1] shadow-[0_24px_55px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.04] backdrop-blur-md md:block">
        {panelChrome}
        <div className="relative z-[1] p-5 sm:p-6 lg:p-7">{filterPanelInner("desktop")}</div>
      </div>

      <div className="relative mb-8 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="relative flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.1rem] border border-amber-200/[0.12] bg-black/45 px-4 py-3 text-sm font-medium text-gray-100 shadow-[0_18px_40px_-35px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.05] backdrop-blur-md transition-[border-color,background-color] hover:border-amber-200/20 hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45"
        >
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
            }}
            aria-hidden
          />
          <SlidersHorizontal className="relative h-4 w-4 text-amber-200/70" strokeWidth={1.75} />
          <span className="relative">Filter &amp; Suche</span>
          {activeChips.length > 0 ? (
            <span className="relative ml-1 rounded-full border border-amber-400/35 bg-amber-950/50 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
              {activeChips.length}
            </span>
          ) : null}
        </button>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]"
              aria-hidden
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-x-0 top-0 z-50 max-h-[min(92vh,720px)] overflow-y-auto rounded-b-[1.25rem] border border-t-0 border-amber-200/[0.12] border-t-transparent bg-[#0c0c0c] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.06]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c0c]/95 px-4 py-3.5 backdrop-blur-md">
                <span className="text-sm font-semibold tracking-tight text-white">Filter &amp; Suche</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-white/10 p-2 text-gray-400 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45"
                  aria-label="Schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative overflow-hidden">
                {panelChrome}
                <div className="relative z-[1] p-4 pb-10">{filterPanelInner("mobile")}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
