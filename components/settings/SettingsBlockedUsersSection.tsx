"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";

type BlockedUser = {
  blocked_id: string;
  nick: string | null;
  avatar_display_url: string | null;
};

export function SettingsBlockedUsersSection() {
  const router = useRouter();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      try {
        const { data: blocks } = await supabase
          .from("blocked_users")
          .select("blocked_id")
          .order("created_at", { ascending: false });
        const ids = (blocks ?? []).map((b: { blocked_id: string }) => b.blocked_id);
        if (ids.length === 0) {
          setUsers([]);
          return;
        }
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nick, avatar_url, avatar_photo_id")
          .in("id", ids);
        const withUrls = await Promise.all(
          (profs ?? []).map(async (p: { id: string; nick: string | null; avatar_url: string | null; avatar_photo_id: string | null }) => {
            const avatar_display_url = await resolveProfileAvatarUrl(
              { avatar_url: p.avatar_url, avatar_photo_id: p.avatar_photo_id },
              supabase
            );
            return [p.id, { nick: p.nick, avatar_display_url }] as const;
          })
        );
        const byId = new Map(withUrls);
        setUsers(
          ids.map((id) => ({
            blocked_id: id,
            nick: byId.get(id)?.nick ?? null,
            avatar_display_url: byId.get(id)?.avatar_display_url ?? null,
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function unblock(blockedId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedId);
    setUsers((prev) => prev.filter((u) => u.blocked_id !== blockedId));
    router.refresh();
  }

  const supabase = createClient();

  return (
    <div>
      <h3 className="text-base font-semibold text-white">Blockierte Nutzer</h3>
      <p className="mt-1 text-sm text-gray-400">
        Diese Profile sind fuer dich gesperrt. Bei Bedarf kannst du einzelne Nutzer wieder entsperren.
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Wird geladen ...</p>
      ) : users.length === 0 ? (
        <p className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-400">
          Aktuell ist kein Nutzer blockiert.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {users.map((u) => (
            <li
              key={u.blocked_id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-600 bg-background">
                  {u.avatar_display_url ? (
                    <img
                      src={u.avatar_display_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                      {(u.nick ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-medium text-white">{u.nick ?? "—"}</span>
              </div>
              <button
                type="button"
                onClick={() => unblock(u.blocked_id)}
                className="rounded-lg border border-sky-400/35 bg-sky-500/10 px-3 py-1.5 text-sm text-sky-100 transition-colors hover:bg-sky-500/20"
              >
                Entsperren
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
