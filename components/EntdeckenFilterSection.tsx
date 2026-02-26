"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { PREFERENCES_OPTIONS } from "@/types";

type Props = {
  roleFilter: string | null;
  genderFilter: string | null;
  experienceFilter: string | null;
  preferenceFilter: string | null;
  plzPrefix: string | null;
  myPlzPrefix: string | null;
  keuschhaltungFilter: "keyholder_gesucht" | "sub_gesucht" | null;
};

export function EntdeckenFilterSection({
  roleFilter,
  genderFilter,
  experienceFilter,
  preferenceFilter,
  plzPrefix,
  myPlzPrefix,
  keuschhaltungFilter,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderForm = (idSuffix: "desktop" | "mobile") => (
    <form
      method="get"
      action="/dashboard/entdecken"
      className={idSuffix === "mobile" ? "flex flex-col gap-4" : "flex flex-wrap items-end gap-4"}
      onSubmit={() => setMobileOpen(false)}
    >
      <div>
        <label htmlFor={`role-${idSuffix}`} className="mb-1 block text-xs text-gray-500">Rolle</label>
        <select
          id={`role-${idSuffix}`}
          name="role"
          defaultValue={roleFilter ?? ""}
          className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        >
          <option value="">Alle</option>
          <option value="Dom">Dom</option>
          <option value="Sub">Sub</option>
          <option value="Switcher">Switcher</option>
        </select>
      </div>
      <div>
        <label htmlFor={`gender-${idSuffix}`} className="mb-1 block text-xs text-gray-500">Geschlecht</label>
        <select
          id={`gender-${idSuffix}`}
          name="gender"
          defaultValue={genderFilter ?? ""}
          className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        >
          <option value="">Alle</option>
          <option value="Mann">Mann</option>
          <option value="Frau">Frau</option>
          <option value="Divers">Divers</option>
        </select>
      </div>
      <div>
        <label htmlFor={`experience-${idSuffix}`} className="mb-1 block text-xs text-gray-500">Erfahrung</label>
        <select
          id={`experience-${idSuffix}`}
          name="experience"
          defaultValue={experienceFilter ?? ""}
          className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        >
          <option value="">Alle</option>
          <option value="beginner">Einsteiger:in</option>
          <option value="experienced">Erfahren</option>
          <option value="advanced">Sehr erfahren</option>
        </select>
      </div>
      <div>
        <label htmlFor={`keuschhaltung-${idSuffix}`} className="mb-1 block text-xs text-gray-500">Keuschhaltung</label>
        <select
          id={`keuschhaltung-${idSuffix}`}
          name="keuschhaltung"
          defaultValue={keuschhaltungFilter ?? ""}
          className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        >
          <option value="">Alle</option>
          <option value="keyholder_gesucht">Keyholder gesucht</option>
          <option value="sub_gesucht">Sub gesucht</option>
        </select>
      </div>
      <div>
        <label htmlFor={`preference-${idSuffix}`} className="mb-1 block text-xs text-gray-500">Vorliebe</label>
        <select
          id={`preference-${idSuffix}`}
          name="preference"
          defaultValue={preferenceFilter ?? ""}
          className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
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
        <label htmlFor={`plz_prefix-${idSuffix}`} className="mb-1 block text-xs text-gray-500">PLZ (Anfang)</label>
        <input
          id={`plz_prefix-${idSuffix}`}
          name="plz_prefix"
          type="text"
          inputMode="numeric"
          maxLength={3}
          defaultValue={plzPrefix ?? ""}
          placeholder="z. B. 80"
          className="w-24 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        />
      </div>
      <div className={idSuffix === "mobile" ? "flex flex-col gap-2" : "contents"}>
      <button
        type="submit"
        className="min-h-[44px] rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Filtern
      </button>
      {myPlzPrefix && (
        <Link
          href={`/dashboard/entdecken?plz_prefix=${myPlzPrefix}`}
          className="min-h-[44px] flex items-center justify-center rounded-lg border border-gray-600 px-4 py-3 text-sm text-gray-300 hover:border-gray-500 hover:text-white"
          onClick={() => setMobileOpen(false)}
        >
          Meine Umgebung
        </Link>
      )}
      <Link
        href="/dashboard/entdecken"
        className="min-h-[44px] flex items-center justify-center rounded-lg border border-gray-600 px-4 py-3 text-sm text-gray-400 hover:border-gray-500 hover:text-white"
        onClick={() => setMobileOpen(false)}
      >
        Alle anzeigen
      </Link>
      </div>
    </form>
  );

  return (
    <>
      {/* Desktop: Formular sichtbar */}
      <div className="mb-8 hidden rounded-xl border border-gray-700 bg-card p-6 shadow-sm md:block">
        {renderForm("desktop")}
      </div>

      {/* Mobile: Filter-Button + Sheet */}
      <div className="mb-8 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-card px-4 py-3 text-sm font-medium text-gray-300 shadow-sm hover:border-gray-600 hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60"
              aria-hidden
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-x-0 top-0 z-50 max-h-[90vh] overflow-y-auto rounded-b-xl border border-t-0 border-gray-700 bg-card shadow-xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-700 bg-card px-4 py-3">
                <span className="font-medium text-white">Filter</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                  aria-label="Schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 pb-8">
                {renderForm("mobile")}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
