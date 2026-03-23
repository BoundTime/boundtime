"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
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
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const isChatView = pathSegments[pathSegments.length - 2] === "nachrichten" && pathSegments.length >= 3;

  return (
    <Container className="py-10 md:py-14">
      <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 transition-colors hover:text-white">
        ← MyBound
      </Link>

      <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-b from-[#1f1f1f] to-[#151515] px-5 py-4 md:px-6">
        <h1 className="text-xl font-bold text-white md:text-2xl">Nachrichten</h1>
      </div>

      {/* dvh berücksichtigt mobile Browser-UI; min-h-0 auf Flex-Kindern ermöglicht Scroll in der Inbox */}
      <div className="flex min-h-[360px] max-h-[calc(100vh-11rem)] supports-[height:100dvh]:max-h-[calc(100dvh-11rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.95)] md:flex-row md:gap-0">
        <aside
          className={`${
            isChatView ? "hidden md:flex" : "flex"
          } w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-b border-white/10 bg-black/20 md:w-[340px] md:flex-none md:shrink-0 md:border-b-0 md:border-r`}
        >
          <div className="shrink-0 border-b border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-100/90">Posteingang</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 pb-5 [-webkit-overflow-scrolling:touch]">
            <ul className="space-y-2.5">
              {list.map((item) => {
                const avatarUrl = item.otherAvatarUrl;
                const initials = (item.otherNick ?? "?")
                  .split(/[\s_]+/)
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const preview = item.lastContent
                  ? (item.lastContent.length > 50 ? item.lastContent.slice(0, 50) + "…" : item.lastContent)
                  : "—";
                const timeStr = formatTimeAgo(new Date(item.lastAt));
                const isActive = pathSegments[pathSegments.length - 1] === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/nachrichten/${item.id}`}
                      className={`flex min-h-[56px] items-center gap-3 rounded-xl border px-3 py-3 transition-all ${
                        isActive
                          ? "border-amber-300/45 bg-amber-300/10 shadow-[0_10px_25px_-20px_rgba(212,175,55,0.8)]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <AvatarWithVerified verified={item.otherVerified} size="sm" className="h-10 w-10 shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-full border border-gray-700 bg-background">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-accent">
                            {initials}
                          </span>
                        )}
                      </div>
                      </AvatarWithVerified>
                      <div className="min-w-0 flex-1">
                        <p className={`flex items-center gap-1.5 truncate ${item.hasUnread ? "font-semibold text-white" : "font-medium text-white"}`}>
                          {item.otherNick}
                          {item.hasUnread && (
                            <span className="flex h-2 min-w-2 shrink-0 items-center justify-center rounded-full bg-amber-300" aria-label="Ungelesen" />
                          )}
                          <OnlineIndicator lastSeenAt={item.otherLastSeenAt} variant="dot" />
                        </p>
                        <p className={`truncate text-xs ${item.hasUnread ? "text-gray-200" : "text-gray-400"}`}>{preview}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="text-xs text-gray-500">{timeStr}</p>
                        {(item.unreadCount ?? 0) > 0 && (
                          <span className="rounded-full border border-amber-300/40 bg-amber-300/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-100">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Rechte Spalte: Chat oder Platzhalter */}
        <main
          className={`${
            isChatView ? "flex" : "hidden md:flex"
          } min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#171717] to-[#121212] md:min-h-[360px]`}
        >
          {children}
        </main>
      </div>
    </Container>
  );
}
