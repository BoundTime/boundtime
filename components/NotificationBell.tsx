"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NOTIFICATION_LABELS, type NotificationType } from "@/types";

type NotificationRow = {
  id: string;
  type: NotificationType;
  read_at: string | null;
  created_at: string;
  related_user_id: string | null;
  related_id: string | null;
  related_user_nick?: string | null;
};

function getNotificationHref(n: NotificationRow): string {
  switch (n.type) {
    case "new_message":
      return n.related_id ? `/dashboard/nachrichten/${n.related_id}` : "/dashboard/nachrichten";
    case "new_follower":
    case "profile_view":
    case "profile_like":
      return n.related_user_id ? `/dashboard/entdecken/${n.related_user_id}` : "/dashboard/entdecken";
    case "post_like":
      return n.related_id ? `/dashboard/aktivitaet/post-likes#post-${n.related_id}` : "/dashboard/aktivitaet/post-likes";
    case "photo_like":
    case "photo_comment":
      return n.related_id ? `/dashboard/foto/${n.related_id}` : "/dashboard/benachrichtigungen";
    case "chastity_new_task":
    case "chastity_deadline_soon":
    case "chastity_arrangement_offer":
    case "chastity_sub_request":
      return "/dashboard/keuschhaltung";
    case "chastity_task_awaiting_confirmation":
    case "chastity_reward_request":
      return "/dashboard/keuschhaltung";
    case "verification_rejected":
      return "/dashboard/verifizierung";
    default:
      return "/dashboard/benachrichtigungen";
  }
}

type NotificationBellProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function NotificationBell({ variant = "desktop", onNavigate }: NotificationBellProps = {}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [list, setList] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, count } = await supabase
        .from("notifications")
        .select("id, type, read_at, created_at, related_user_id, related_id", { count: "exact" })
        .eq("user_id", user.id)
        .is("read_at", null)
        .order("created_at", { ascending: false });
      const rows = (data ?? []) as NotificationRow[];
      const likerIds = Array.from(new Set(rows.filter((r) => r.type === "post_like" && r.related_user_id).map((r) => r.related_user_id!)));
      const nickById: Record<string, string> = {};
      if (likerIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, nick").in("id", likerIds);
        for (const p of profs ?? []) {
          nickById[p.id] = p.nick ?? "?";
        }
      }
      const withNick = rows.map((r) =>
        r.type === "post_like" && r.related_user_id
          ? { ...r, related_user_nick: nickById[r.related_user_id] ?? "?" }
          : r
      );
      setUnreadCount(count ?? 0);
      setList(withNick);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function markAllRead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    setUnreadCount(0);
    setList([]);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    if (variant === "mobile") {
      return (
        <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-base text-gray-300">
          <Bell className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          Benachrichtigungen
        </div>
      );
    }
    return (
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg p-2 text-gray-300"
        aria-label="Benachrichtigungen"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
      </button>
    );
  }

  if (variant === "mobile") {
    return (
      <Link
        href="/dashboard/benachrichtigungen"
        onClick={onNavigate}
        className="relative flex items-center gap-2 rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white"
      >
        <Bell className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        Benachrichtigungen
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center rounded-lg p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        aria-label={unreadCount > 0 ? `${unreadCount} ungelesene Benachrichtigungen` : "Benachrichtigungen"}
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="absolute right-0 top-full z-50 mt-1 w-80 max-h-[70vh] overflow-hidden rounded-xl border border-gray-700 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <span className="font-semibold text-white">Benachrichtigungen</span>
              <Link
                href="/dashboard/benachrichtigungen"
                onClick={() => { setOpen(false); markAllRead(); }}
                className="text-xs text-accent hover:underline"
              >
                Alle anzeigen
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {list.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">Keine neuen Benachrichtigungen.</p>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {list.slice(0, 10).map((n) => (
                    <li key={n.id}>
                      <Link
                        href={getNotificationHref(n)}
                        onClick={() => { setOpen(false); markAllRead(); }}
                        className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        {n.type === "post_like" && n.related_user_nick
                          ? `${n.related_user_nick} hat deinen Post geliked`
                          : NOTIFICATION_LABELS[n.type]}
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {formatTimeAgo(new Date(n.created_at))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString("de-DE");
}
