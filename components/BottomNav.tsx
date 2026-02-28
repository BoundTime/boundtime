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

export function BottomNav() {
  const pathname = usePathname();
  const unreadMessages = useUnreadMessageCount();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-card/95 backdrop-blur md:hidden"
      aria-label="Hauptnavigation"
    >
      <div className="flex items-center justify-around py-3">
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
              <Link
                key={item.label}
                href="/dashboard?scroll=post"
                className="-mt-6 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform active:scale-95"
                aria-label="Post erstellen"
              >
                <Plus className="h-7 w-7" strokeWidth={2} />
              </Link>
            );
          }

          const showMessageBadge = item.href === "/dashboard/nachrichten" && unreadMessages > 0;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-3 px-2 text-xs transition-colors ${
                isActive ? "text-accent" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <span className="relative shrink-0">
                <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                {showMessageBadge && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
