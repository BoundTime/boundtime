"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { SlidersHorizontal, LayoutGrid, List, ShieldCheck } from "lucide-react";

const ROLES = ["Alle Rollen", "Dom", "Sub", "Switcher", "Bull"] as const;

type Props = {
  roleFilter: string | null;
  verifiedOnly: boolean;
  radiusKm: number | null;
  view: "grid" | "list";
};

function buildParams(
  current: URLSearchParams,
  updates: Record<string, string | null>
): string {
  const p = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(updates)) {
    if (v === null || v === "") {
      p.delete(k);
    } else {
      p.set(k, v);
    }
  }
  const s = p.toString();
  return s ? `/dashboard/entdecken?${s}` : "/dashboard/entdecken";
}

export function FilterBar({ roleFilter, verifiedOnly, radiusKm, view }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRadiusInput, setShowRadiusInput] = useState(false);
  const [radiusInput, setRadiusInput] = useState(radiusKm != null ? String(radiusKm) : "");

  const navigate = useCallback(
    (updates: Record<string, string | null>) => {
      router.push(buildParams(searchParams, updates));
    },
    [router, searchParams]
  );

  function handleRoleClick(role: string) {
    navigate({ role: role === "Alle Rollen" ? null : role });
  }

  function handleVerifiedToggle() {
    navigate({ verified: verifiedOnly ? null : "1" });
  }

  function handleRadiusSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(radiusInput, 10);
    if (!isNaN(val) && val > 0) {
      navigate({ radius_km: String(Math.min(500, val)) });
    } else {
      navigate({ radius_km: null });
    }
    setShowRadiusInput(false);
  }

  function handleViewToggle(v: "grid" | "list") {
    navigate({ view: v === "grid" ? null : "list" });
  }

  const pillBase =
    "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer shrink-0";
  const pillActive =
    "bg-[rgba(123,17,17,0.08)] border-[rgba(123,17,17,0.3)] text-[#7B1111]";
  const pillInactive =
    "bg-transparent border-white/15 text-gray-400 hover:text-gray-200 hover:border-white/25";

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Scrollable pill area */}
      <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-none pb-0.5">
        {ROLES.map((role) => {
          const active =
            role === "Alle Rollen" ? !roleFilter : roleFilter === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleClick(role)}
              className={`${pillBase} ${active ? pillActive : pillInactive}`}
            >
              {role}
            </button>
          );
        })}

        {/* Separator */}
        <div className="shrink-0 w-px h-5 bg-white/10 mx-1" />

        {/* Nur Verifiziert */}
        <button
          type="button"
          onClick={handleVerifiedToggle}
          className={`${pillBase} ${verifiedOnly ? pillActive : pillInactive}`}
        >
          <ShieldCheck size={12} />
          Nur Verifiziert
        </button>

        {/* Umkreis */}
        {showRadiusInput ? (
          <form onSubmit={handleRadiusSubmit} className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              value={radiusInput}
              onChange={(e) => setRadiusInput(e.target.value)}
              placeholder="km"
              className="w-16 rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[12px] text-white focus:outline-none focus:border-[rgba(123,17,17,0.4)]"
              autoFocus
              min={1}
              max={500}
            />
            <button type="submit" className={`${pillBase} ${pillActive}`}>
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRadiusInput(false);
                navigate({ radius_km: null });
              }}
              className={`${pillBase} ${pillInactive}`}
            >
              ×
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowRadiusInput(true)}
            className={`${pillBase} ${radiusKm != null ? pillActive : pillInactive}`}
          >
            {radiusKm != null ? `Umkreis: ${radiusKm} km` : "Umkreis"}
          </button>
        )}
      </div>

      {/* Grid/List toggle */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => handleViewToggle("grid")}
          className={`flex items-center justify-center rounded-md border transition-colors ${
            view === "grid"
              ? "bg-[#7B1111] border-[#7B1111] text-white"
              : "border-white/12 bg-transparent text-gray-500 hover:text-gray-300"
          }`}
          style={{ width: 32, height: 32 }}
          aria-label="Rasteransicht"
        >
          <LayoutGrid size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleViewToggle("list")}
          className={`flex items-center justify-center rounded-md border transition-colors ${
            view === "list"
              ? "bg-[#7B1111] border-[#7B1111] text-white"
              : "border-white/12 bg-transparent text-gray-500 hover:text-gray-300"
          }`}
          style={{ width: 32, height: 32 }}
          aria-label="Listenansicht"
        >
          <List size={14} />
        </button>
      </div>

      {/* Alle Filter Button */}
      <button
        type="button"
        onClick={() => router.push(`/dashboard/entdecken?${searchParams.toString()}&advanced=1`)}
        className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/12 bg-[#1a1a1a] px-3 py-1.5 text-[12px] text-gray-400 hover:text-gray-200 transition-colors"
      >
        <SlidersHorizontal size={12} />
        Alle Filter
      </button>
    </div>
  );
}
