"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Home,
  Search,
  MessageSquare,
  Users,
  Lock,
  Eye,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string | null;
};

type SidebarProps = {
  nick: string;
  role: string | null;
  city: string | null;
  avatarUrl?: string | null;
  unreadMessages: number;
  hasActiveKeuschhaltung: boolean;
  activeKeuschhaltung?: {
    partnerNick: string;
    lockedAt: string | null;
    daysTotal: number | null;
    boundDollars: number;
  } | null;
};

const ROLE_LABEL: Record<string, string> = {
  Dom: "Dom",
  Sub: "Sub",
  Switcher: "Switcher",
  Bull: "Bull",
  Hotwife: "Hotwife",
};

export function DashboardSidebar({
  nick,
  role,
  city,
  avatarUrl,
  unreadMessages,
  hasActiveKeuschhaltung,
  activeKeuschhaltung,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = (nick || "M").slice(0, 2).toUpperCase();
  const roleLabel = role ? (ROLE_LABEL[role] ?? role) : null;
  const metaLine = [roleLabel, city].filter(Boolean).join(" · ");

  const mainNav: NavItem[] = [
    { href: "/dashboard", label: "MyBound", icon: Home },
    { href: "/dashboard/entdecken", label: "Entdecken", icon: Search },
    {
      href: "/dashboard/nachrichten",
      label: "Nachrichten",
      icon: MessageSquare,
      badge: unreadMessages > 0 ? (unreadMessages > 99 ? "99+" : String(unreadMessages)) : null,
    },
    { href: "/dashboard/forum", label: "Forum", icon: Users },
  ];

  const featureNav: NavItem[] = [
    {
      href: "/dashboard/keuschhaltung",
      label: "Keuschhaltung",
      icon: Lock,
      badge: hasActiveKeuschhaltung ? "aktiv" : null,
    },
    { href: "/dashboard/cuckymode", label: "Cuckymode", icon: Eye },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  let daysBound = 0;
  let daysTotal = activeKeuschhaltung?.daysTotal ?? null;
  if (activeKeuschhaltung?.lockedAt) {
    daysBound = Math.max(
      0,
      Math.floor((Date.now() - new Date(activeKeuschhaltung.lockedAt).getTime()) / 86400000)
    );
  }
  const progressPct =
    daysTotal && daysTotal > 0 ? Math.min(100, Math.round((daysBound / daysTotal) * 100)) : 0;

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-white/10 bg-[#0f0f0f] h-screen sticky top-0 overflow-y-auto"
      style={{ zIndex: 40 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 border-b border-white/10" style={{ height: 56 }}>
        <div
          className="flex items-center justify-center rounded-lg text-white font-bold text-xs shrink-0"
          style={{ width: 28, height: 28, background: "#7B1111", borderRadius: 8 }}
        >
          BT
        </div>
        <span className="font-medium text-[14px] text-white">BoundTime</span>
      </div>

      {/* Profil-Schnellzugriff */}
      <Link
        href="/dashboard/profil"
        className="flex items-center gap-3 px-4 py-3 border-b border-white/10 hover:bg-white/[0.04] transition-colors"
      >
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={nick || "Avatar"}
              className="rounded-full object-cover"
              style={{ width: 36, height: 36 }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full text-white text-xs font-semibold"
              style={{ width: 36, height: 36, background: "#7B1111" }}
            >
              {initials}
            </div>
          )}
          <span
            className="absolute bottom-0 right-0 rounded-full border-2 border-[#0f0f0f]"
            style={{ width: 9, height: 9, background: "#22C55E" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-white truncate">{nick || "Mitglied"}</p>
          {metaLine && (
            <p className="text-[11px] text-gray-500 truncate">{metaLine}</p>
          )}
        </div>
        <ChevronDown size={14} className="text-gray-600 shrink-0" strokeWidth={1.5} />
      </Link>

      {/* Haupt-Navigation */}
      <nav className="flex-1 pt-2">
        <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-gray-600 font-medium">
          Hauptmenü
        </p>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 mx-2 my-px px-3 py-2 rounded-md transition-colors text-[13px] ${
                active
                  ? "bg-[rgba(123,17,17,0.08)] text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                size={16}
                strokeWidth={1.75}
                className={active ? "text-[#7B1111]" : ""}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.label === "Nachrichten" && (
                <span className="flex items-center justify-center rounded-full bg-[#7B1111] text-white text-[10px] font-semibold min-w-[17px] h-[17px] px-1">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <p className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-widest text-gray-600 font-medium">
          Features
        </p>
        {featureNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 mx-2 my-px px-3 py-2 rounded-md transition-colors text-[13px] ${
                active
                  ? "bg-[rgba(123,17,17,0.08)] text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                size={16}
                strokeWidth={1.75}
                className={active ? "text-[#7B1111]" : ""}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge === "aktiv" && (
                <span
                  className="rounded-full text-[10px] font-medium px-2 py-0.5"
                  style={{ background: "rgba(201,169,81,0.12)", color: "#8A6D2E", border: "1px solid rgba(201,169,81,0.25)" }}
                >
                  Aktiv
                </span>
              )}
            </Link>
          );
        })}

        {/* Keuschhaltungs-Status-Widget */}
        {hasActiveKeuschhaltung && activeKeuschhaltung && (
          <Link
            href="/dashboard/keuschhaltung"
            className="block mx-2 my-2 rounded-lg p-2.5 transition-colors hover:bg-[rgba(123,17,17,0.08)]"
            style={{
              background: "rgba(123,17,17,0.06)",
              border: "1px solid rgba(123,17,17,0.2)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lock size={11} className="text-[#7B1111]" strokeWidth={2} />
              <span className="text-[11px] font-medium text-[#7B1111]">
                Bound: {daysBound}{daysTotal ? ` / ${daysTotal}` : ""} Tage
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden mb-1.5"
              style={{ height: 4, background: "rgba(123,17,17,0.12)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: "#7B1111" }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                {daysTotal ? `${daysTotal - daysBound} Tage verbleibend` : `${daysBound} Tage`}
              </span>
              <span className="text-[11px] font-medium" style={{ color: "#8A6D2E" }}>
                {activeKeuschhaltung.boundDollars} BD
              </span>
            </div>
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div className="mt-auto border-t border-white/10 px-2 py-2">
        <Link
          href="/dashboard/einstellungen"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <Settings size={14} strokeWidth={1.75} />
          Einstellungen
        </Link>
        <Link
          href="/dashboard/profil/bearbeiten"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <ShieldCheck size={14} strokeWidth={1.75} />
          Verifizierung
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-[12px] text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <LogOut size={14} strokeWidth={1.75} />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
