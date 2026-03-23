"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageSquare, User, Plus } from "lucide-react";
import { useUnreadMessageCount } from "@/lib/useUnreadMessageCount";

const navItems = [
  { href: "/dashboard", label: "MyBound", icon: Home },
  { href: "/dashboard/entdecken", label: "Entdecken", icon: Search },
  { href: "/dashboard", label: "Post", icon: Plus, center: true },
  { href: "/dashboard/nachrichten", label: "Nachrichten", icon: MessageSquare },
  { href: "/dashboard/profil", label: "Profil", icon: User },
];

const iconSize = 22;
const iconStroke = 1.5;

export function BottomNav() {
  const pathname = usePathname();
  const unreadMessages = useUnreadMessageCount();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Hauptnavigation"
    >
      <div className="relative border-t border-amber-200/[0.1] bg-black/75 shadow-[0_-12px_40px_-18px_rgba(0,0,0,0.85)] backdrop-blur-xl ring-1 ring-white/[0.05]">
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
          aria-hidden
        />
        <div className="relative flex items-end justify-between gap-0.5 px-1.5 pb-1 pt-2 sm:px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCenter = item.center === true;
            const isActive =
              !isCenter &&
              (item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href));

            if (isCenter) {
              return (
                <div key={item.label} className="flex flex-1 justify-center px-0.5">
                  <Link
                    href="/dashboard?scroll=post"
                    className="relative -mt-5 flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border border-amber-400/45 bg-gradient-to-b from-zinc-800/95 to-black text-amber-50 shadow-[0_10px_28px_-8px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] transition-[transform,box-shadow,border-color] duration-200 ease-out active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:active:scale-100"
                    aria-label="Post erstellen"
                  >
                    <Plus className="h-7 w-7" width={28} height={28} strokeWidth={iconStroke} aria-hidden />
                  </Link>
                </div>
              );
            }

            const showMessageBadge = item.href === "/dashboard/nachrichten" && unreadMessages > 0;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-end gap-1 rounded-xl px-1 py-1.5 transition-[color,background-color] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] active:bg-white/[0.04] motion-reduce:transition-none ${
                  isActive
                    ? "text-amber-100/95 before:pointer-events-none before:absolute before:left-1/2 before:top-0 before:h-[3px] before:w-9 before:-translate-x-1/2 before:rounded-full before:bg-amber-400/90 before:shadow-[0_0_12px_rgba(251,191,36,0.35)] before:content-['']"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="relative flex h-[26px] w-[26px] shrink-0 items-center justify-center">
                  <Icon
                    className={isActive ? "text-amber-200/95" : undefined}
                    width={iconSize}
                    height={iconSize}
                    strokeWidth={iconStroke}
                    aria-hidden
                  />
                  {showMessageBadge && (
                    <span
                      className="absolute -right-2 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-black/90 bg-gradient-to-b from-amber-500 to-amber-700 px-1 text-[10px] font-semibold tabular-nums text-white shadow-sm ring-1 ring-amber-300/40"
                      aria-label={`${unreadMessages} ungelesen`}
                    >
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </span>
                <span
                  className={`max-w-full truncate text-center text-[11px] leading-tight tracking-wide ${
                    isActive ? "font-semibold text-amber-50/95" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
