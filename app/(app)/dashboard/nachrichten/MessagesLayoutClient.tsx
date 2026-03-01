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
    <Container className="py-16">
      <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 hover:text-white">
        ← MyBound
      </Link>

      <div className="flex max-h-[calc(100vh-10rem)] min-h-[350px] flex-col gap-0 overflow-hidden rounded-xl border border-gray-700 md:flex-row md:gap-0">
        {/* Linke Spalte: Gesprächsliste – auf Mobile ausgeblendet wenn Chat sichtbar */}
        <aside
          className={`${
            isChatView ? "hidden md:flex" : "flex"
          } w-full min-w-0 flex-col border-b border-gray-700 md:w-[300px] md:shrink-0 md:border-b-0 md:border-r`}
        >
          <div className="bg-gradient-to-b from-gray-800/80 to-card px-4 py-4 sm:px-6">
            <h1 className="text-xl font-bold text-white">Nachrichten</h1>
            <p className="mt-0.5 text-sm text-gray-400">Deine Unterhaltungen</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:max-h-[70vh]">
            <ul className="space-y-2">
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
                      className={`flex min-h-[44px] items-center gap-3 rounded-lg border p-3 transition-colors ${
                        isActive
                          ? "border-accent/60 bg-accent/10"
                          : "border-gray-700 bg-background/50 hover:border-gray-600"
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
                            <span className="flex h-2 min-w-2 shrink-0 items-center justify-center rounded-full bg-accent" aria-label="Ungelesen" />
                          )}
                          <OnlineIndicator lastSeenAt={item.otherLastSeenAt} variant="dot" />
                        </p>
                        <p className={`truncate text-xs ${item.hasUnread ? "text-gray-300" : "text-gray-500"}`}>{preview}</p>
                      </div>
                      <p className="shrink-0 text-xs text-gray-500">{timeStr}</p>
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
          } min-h-[300px] min-w-0 flex-1 flex-col overflow-hidden`}
        >
          {children}
        </main>
      </div>
    </Container>
  );
}
