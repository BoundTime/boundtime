"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus, SlidersHorizontal, Pencil, MoreVertical } from "lucide-react";

const ROUTE_TITLES: Array<{ pattern: RegExp | string; label: string }> = [
  { pattern: /^\/dashboard\/entdecken\/[^/]+\//, label: "Profil" },
  { pattern: "/dashboard/entdecken", label: "Entdecken" },
  { pattern: "/dashboard/nachrichten", label: "Nachrichten" },
  { pattern: "/dashboard/keuschhaltung", label: "Keuschhaltung" },
  { pattern: "/dashboard/cuckymode", label: "Cuckymode" },
  { pattern: "/dashboard/forum", label: "Forum" },
  { pattern: "/dashboard/profil/bearbeiten", label: "Profil bearbeiten" },
  { pattern: "/dashboard/profil", label: "Profil" },
  { pattern: "/dashboard/einstellungen", label: "Einstellungen" },
  { pattern: "/dashboard/verifizierung", label: "Verifizierung" },
  { pattern: "/dashboard/alben", label: "Alben" },
  { pattern: "/dashboard/benachrichtigungen", label: "Benachrichtigungen" },
  { pattern: "/dashboard/aktivitaet", label: "Aktivität" },
  { pattern: "/dashboard/admin", label: "Admin" },
  { pattern: /^\/dashboard$/, label: "MyBound" },
];

function getTitle(pathname: string): string {
  for (const { pattern, label } of ROUTE_TITLES) {
    if (typeof pattern === "string") {
      if (pathname === pattern || pathname.startsWith(pattern + "/")) return label;
    } else {
      if (pattern.test(pathname)) return label;
    }
  }
  return "MyBound";
}

type TopbarProps = {
  hasUnreadNotifications?: boolean;
};

export function DashboardTopbar({ hasUnreadNotifications = false }: TopbarProps) {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const isHome = pathname === "/dashboard";
  const isEntdecken = pathname === "/dashboard/entdecken" || pathname.startsWith("/dashboard/entdecken/");
  const isNachrichten = pathname === "/dashboard/nachrichten" || pathname.startsWith("/dashboard/nachrichten/");
  const isKeuschhaltung = pathname === "/dashboard/keuschhaltung" || pathname.startsWith("/dashboard/keuschhaltung/");
  const isProfil = pathname === "/dashboard/profil" || pathname.startsWith("/dashboard/profil/");

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f0f0f]">
      {/* Desktop Topbar */}
      <div className="hidden md:flex items-center justify-between px-6" style={{ height: 56 }}>
        <span className="text-[15px] font-medium text-white">{title}</span>
        <div className="flex items-center gap-2">
          {isHome && (
            <Link
              href="/dashboard?scroll=post"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/15 text-[12px] text-gray-300 hover:text-white hover:border-white/25 transition-colors"
            >
              <Plus size={14} strokeWidth={2} />
              Post erstellen
            </Link>
          )}
          <Link
            href="/dashboard/benachrichtigungen"
            className="relative flex items-center justify-center rounded-md border border-white/12 text-gray-400 hover:text-white hover:border-white/22 transition-colors"
            style={{ width: 32, height: 32 }}
            aria-label="Benachrichtigungen"
          >
            <Bell size={16} strokeWidth={1.75} />
            {hasUnreadNotifications && (
              <span
                className="absolute top-1 right-1 rounded-full bg-[#7B1111]"
                style={{ width: 6, height: 6 }}
              />
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="flex md:hidden items-center justify-between px-4" style={{ height: 44 }}>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center text-white text-[11px] font-bold rounded-[6px]"
            style={{ width: 22, height: 22, background: "#7B1111" }}
            aria-hidden
          >
            BT
          </div>
          <span className="text-[13px] font-medium text-white">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          {isHome && (
            <>
              <Link
                href="/dashboard/benachrichtigungen"
                className="relative flex items-center justify-center text-gray-400 active:text-white"
                style={{ width: 36, height: 36 }}
                aria-label="Benachrichtigungen"
              >
                <Bell size={18} strokeWidth={1.75} />
                {hasUnreadNotifications && (
                  <span className="absolute top-2 right-2 rounded-full bg-[#7B1111]" style={{ width: 6, height: 6 }} />
                )}
              </Link>
              <Link
                href="/dashboard?scroll=post"
                className="flex items-center justify-center text-gray-400 active:text-white"
                style={{ width: 36, height: 36 }}
                aria-label="Post erstellen"
              >
                <Plus size={18} strokeWidth={2} />
              </Link>
            </>
          )}
          {isEntdecken && (
            <button
              className="flex items-center justify-center text-gray-400 active:text-white"
              style={{ width: 36, height: 36 }}
              aria-label="Filter"
            >
              <SlidersHorizontal size={18} strokeWidth={1.75} />
            </button>
          )}
          {isNachrichten && (
            <Link
              href="/dashboard/nachrichten/neu"
              className="flex items-center justify-center text-gray-400 active:text-white"
              style={{ width: 36, height: 36 }}
              aria-label="Neue Unterhaltung"
            >
              <Pencil size={18} strokeWidth={1.75} />
            </Link>
          )}
          {isKeuschhaltung && (
            <Link
              href="/dashboard/keuschhaltung?new=1"
              className="flex items-center justify-center text-gray-400 active:text-white"
              style={{ width: 36, height: 36 }}
              aria-label="Neue Dynamik"
            >
              <Plus size={18} strokeWidth={2} />
            </Link>
          )}
          {isProfil && (
            <button
              className="flex items-center justify-center text-gray-400 active:text-white"
              style={{ width: 36, height: 36 }}
              aria-label="Mehr Optionen"
            >
              <MoreVertical size={18} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
