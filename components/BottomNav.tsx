"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageSquare, Lock, User } from "lucide-react";
import { useUnreadMessageCount } from "@/lib/useUnreadMessageCount";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/entdecken", label: "Entdecken", icon: Search },
  { href: "/dashboard/nachrichten", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/keuschhaltung", label: "Bound", icon: Lock },
  { href: "/dashboard/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const unreadMessages = useUnreadMessageCount();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--color-background-primary,#0f0f0f)] border-t border-[var(--color-border-tertiary,rgba(255,255,255,0.08))]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", height: 56 }}
      aria-label="Hauptnavigation"
    >
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const showMessageBadge = item.href === "/dashboard/nachrichten" && unreadMessages > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-[2px] flex-1 py-1.5 active:scale-[0.97] transition-transform"
            >
              <span
                className="flex items-center justify-center rounded-lg relative"
                style={{
                  width: 36,
                  height: 26,
                  background: isActive ? "rgba(123,17,17,0.08)" : "transparent",
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? "#7B1111" : "var(--color-text-tertiary, #555)" }}
                  aria-hidden
                />
                {showMessageBadge && (
                  <span
                    className="absolute -top-1 -right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#7B1111] px-0.5 text-[9px] font-semibold text-white"
                    aria-label={`${unreadMessages} ungelesen`}
                  >
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </span>
              <span
                className="text-[9px] font-medium"
                style={{ color: isActive ? "#7B1111" : "var(--color-text-tertiary, #555)", fontWeight: isActive ? 500 : 400 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
