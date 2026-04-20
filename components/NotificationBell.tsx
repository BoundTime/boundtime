"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NOTIFICATION_LABELS, type NotificationType } from "@/types";
import { getNotificationMessage, NOTIFICATION_TYPES_WITH_ACTOR } from "@/lib/notification-utils";

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
    case "chastity_task_awaiting_confirmation":
    case "chastity_reward_request":
      return "/dashboard/keuschhaltung";
    case "chastity_arrangement_offer":
    case "chastity_sub_request":
    case "chastity_checkin":
      return n.related_id ? `/dashboard/keuschhaltung/${n.related_id}` : "/dashboard/keuschhaltung";
    case "chastity_task_awaiting_confirmation":
    case "chastity_reward_request":
      return "/dashboard/keuschhaltung";
    case "verification_rejected":
      return "/dashboard/verifizierung";
    case "bull_rating_dispute":
      return "/dashboard/admin/beanstandungen";
    default:
      return "/dashboard/benachrichtigungen";
  }
}

type NotificationBellProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  /** Kompaktere Darstellung in der Desktop-Navbar beim Scrollen */
  compact?: boolean;
};

export function NotificationBell({
  variant = "desktop",
  onNavigate,
  compact = false,
}: NotificationBellProps = {}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [list, setList] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** Panel wird per Portal nach document.body gerendert – ohne eigenes Ref würde „Klick außerhalb“ jeden Klick im Panel schließen und Navigation verhindern. */
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  function updatePanelPosition() {
    if (!buttonRef.current || typeof window === "undefined") return;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelWidth = 320;
    const gap = 8;
    const top = rect.bottom + gap;
    const maxLeft = window.innerWidth - panelWidth - 8;
    const left = Math.max(8, Math.min(rect.right - panelWidth, maxLeft));
    setPanelPos({ top, left });
  }

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
      const actorIds = Array.from(new Set(
        rows
          .filter((r) => r.related_user_id && NOTIFICATION_TYPES_WITH_ACTOR.includes(r.type as NotificationType))
          .map((r) => r.related_user_id!)
      ));
      const nickById: Record<string, string> = {};
      if (actorIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, nick").in("id", actorIds);
        for (const p of profs ?? []) nickById[p.id] = p.nick ?? "?";
      }
      const withNick = rows.map((r) => ({
        ...r,
        related_user_nick: r.related_user_id ? nickById[r.related_user_id] ?? null : null,
      }));
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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /** Nur eine Benachrichtigung als gelesen markieren (Klick auf einen Eintrag in der Glocke). */
  async function markNotificationRead(notificationId: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);
    if (error) return;
    setList((prev) => prev.filter((row) => row.id !== notificationId));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    function handleReposition() {
      updatePanelPosition();
    }
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

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
        className={`relative flex items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.02] p-0 text-gray-200 transition-[width,height,transform,border-color,background-color] duration-200 ease-out hover:-translate-y-px hover:border-amber-500/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
        aria-label="Benachrichtigungen"
      >
        <Bell className={compact ? "h-4 w-4" : "h-[1.15rem] w-[1.15rem]"} strokeWidth={1.5} />
      </button>
    );
  }

  if (variant === "mobile") {
    return (
      <Link
        href="/dashboard/benachrichtigungen"
        onClick={onNavigate}
        className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base font-medium text-gray-300 transition-colors duration-150 hover:border-white/15 hover:bg-white/[0.07] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
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
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((o) => {
            const next = !o;
            if (next) updatePanelPosition();
            return next;
          });
        }}
        className={`relative flex shrink-0 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.02] p-0 text-gray-200 transition-[width,height,transform,border-color,background-color] duration-200 ease-out hover:-translate-y-px hover:border-amber-500/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
        aria-label={unreadCount > 0 ? `${unreadCount} ungelesene Benachrichtigungen` : "Benachrichtigungen"}
      >
        <Bell className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="bt-nav-badge-enter absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[180] w-80 max-h-[70vh] overflow-hidden rounded-xl border border-gray-700 bg-card shadow-xl"
            style={{ top: panelPos.top, left: panelPos.left }}
          >
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <span className="font-semibold text-white">Benachrichtigungen</span>
              <Link
                href="/dashboard/benachrichtigungen"
                onClick={() => setOpen(false)}
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
                        onClick={() => {
                          setOpen(false);
                          void markNotificationRead(n.id);
                        }}
                        className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        {(() => {
                          const msg = getNotificationMessage(n.type as NotificationType, n.related_user_nick ?? (n.related_user_id ? undefined : null));
                          return msg || NOTIFICATION_LABELS[n.type as NotificationType] || n.type;
                        })()}
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {formatTimeAgo(new Date(n.created_at))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body
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
