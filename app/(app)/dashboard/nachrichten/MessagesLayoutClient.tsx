"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";

type ConvItem = {
  id: string;
  otherId: string;
  otherNick: string;
  otherAvatarUrl: string | null;
  otherVerified?: boolean;
  otherLastSeenAt: string | null;
  lastContent: string | null;
  lastAt: string;
  hasUnread?: boolean;
  unreadCount?: number;
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "gerade";
  if (diffMins < 60) return `${diffMins} Min.`;
  if (diffHours < 24) return `${diffHours} Std.`;
  if (diffDays === 1) return "gestern";
  return date.toLocaleDateString("de-DE");
}

export function MessagesLayoutClient({
  list,
  children,
}: {
  list: ConvItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const isChatView = pathSegments[pathSegments.length - 2] === "nachrichten" && pathSegments.length >= 3;

  const filtered = search.trim()
    ? list.filter((item) => item.otherNick.toLowerCase().includes(search.toLowerCase()))
    : list;

  return (
    <div className="flex h-[calc(100vh-44px)] md:h-[calc(100vh-56px)] overflow-hidden">
      {/* Konversationsliste */}
      <aside
        className={`${
          isChatView ? "hidden md:flex" : "flex"
        } flex-col border-r border-white/10 bg-[#0f0f0f] md:w-[260px] md:shrink-0`}
        style={{ width: "100%" }}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-4 py-3.5" style={{ minWidth: 0 }}>
          <p className="text-[14px] font-medium text-white mb-2">Nachrichten</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 text-[12px] text-white placeholder:text-gray-600 focus:border-white/20 focus:outline-none"
            style={{ height: 32 }}
          />
        </div>

        {/* Konversationsliste */}
        <div className="flex-1 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare size={28} className="text-gray-700 mb-3" strokeWidth={1.5} />
              <p className="text-[13px] text-gray-500">Noch keine Nachrichten</p>
              <p className="text-[11px] text-gray-600 mt-1">
                {search ? "Keine Übereinstimmung" : "Starte direkt aus Entdecken"}
              </p>
              {!search && (
                <Link href="/dashboard/entdecken" className="mt-3 text-[11px] text-[#7B1111] hover:underline">
                  Entdecken →
                </Link>
              )}
            </div>
          ) : (
            filtered.map((item) => {
              const avatarUrl = item.otherAvatarUrl;
              const initials = (item.otherNick ?? "?")
                .split(/[\s_]+/)
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const preview = item.lastContent
                ? item.lastContent.length > 45
                  ? item.lastContent.slice(0, 45) + "…"
                  : item.lastContent
                : "—";
              const timeStr = formatTimeAgo(new Date(item.lastAt));
              const isActive = pathSegments[pathSegments.length - 1] === item.id;

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/nachrichten/${item.id}`}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[rgba(123,17,17,0.07)]"
                      : "hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <AvatarWithVerified verified={item.otherVerified} size="sm" className="h-9 w-9">
                      <div className="h-full w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#7B1111]">
                            {initials}
                          </span>
                        )}
                      </div>
                    </AvatarWithVerified>
                    <OnlineIndicator lastSeenAt={item.otherLastSeenAt} variant="dot" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] truncate ${item.hasUnread ? "font-semibold text-white" : "font-medium text-gray-200"}`}>
                        {item.otherNick}
                      </p>
                      <p className="text-[10px] text-gray-600 shrink-0">{timeStr}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`text-[11px] truncate ${item.hasUnread ? "text-gray-300" : "text-gray-500"}`}>
                        {preview}
                      </p>
                      {(item.unreadCount ?? 0) > 0 && (
                        <span
                          className="flex items-center justify-center rounded-full bg-[#7B1111] text-white text-[10px] font-semibold shrink-0 min-w-[17px] h-[17px] px-1"
                        >
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat-Fenster */}
      <main
        className={`${
          isChatView ? "flex" : "hidden md:flex"
        } min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
        style={{ background: "#141414" }}
      >
        {children}
      </main>
    </div>
  );
}
