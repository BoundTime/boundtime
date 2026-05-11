"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";

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

  return (
    <header
      className="sticky top-0 z-30 hidden md:flex items-center justify-between px-6 border-b border-white/10 bg-[#0f0f0f]"
      style={{ height: 50 }}
    >
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
    </header>
  );
}
