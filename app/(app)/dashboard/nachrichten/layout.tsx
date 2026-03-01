import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { MessagesLayoutClient } from "./MessagesLayoutClient";

async function getConversationList(userId: string) {
  const supabase = await createClient();
  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`);
  const convIds = (convs ?? []).map((c) => c.id);
  if (convIds.length === 0) return null;

  const [lastMessagesRes, unreadRes] = await Promise.all([
    supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("conversation_id, created_at")
      .in("conversation_id", convIds)
      .neq("sender_id", userId)
      .is("read_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const lastByConv = new Map<string, { content: string; created_at: string }>();
  (lastMessagesRes.data ?? []).forEach((m) => {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, { content: m.content, created_at: m.created_at });
    }
  });

  const unreadByConv = new Map<string, { count: number; latestAt: string }>();
  (unreadRes.data ?? []).forEach((m) => {
    const cur = unreadByConv.get(m.conversation_id);
    if (!cur) {
      unreadByConv.set(m.conversation_id, { count: 1, latestAt: m.created_at });
    } else {
      unreadByConv.set(m.conversation_id, { count: cur.count + 1, latestAt: cur.latestAt });
    }
  });

  const { data: convDetails } = await supabase
    .from("conversations")
    .select("id, participant_a, participant_b, created_at")
    .in("id", convIds);
  const otherIds = new Set<string>();
  convDetails?.forEach((c) => {
    otherIds.add(c.participant_a === userId ? c.participant_b : c.participant_a);
  });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nick, avatar_url, avatar_photo_id, last_seen_at, verified")
    .in("id", Array.from(otherIds));
  const profileById = new Map<string, { nick: string | null; avatar_display_url: string | null; last_seen_at: string | null; verified: boolean }>();
  if (profiles?.length) {
    await Promise.all(
      profiles.map(async (p) => {
        const avatar_display_url = await resolveProfileAvatarUrl(
          { avatar_url: p.avatar_url, avatar_photo_id: p.avatar_photo_id },
          supabase
        );
        profileById.set(p.id, {
          nick: p.nick,
          avatar_display_url,
          last_seen_at: p.last_seen_at ?? null,
          verified: p.verified ?? false,
        });
      })
    );
  }

  const list = (convDetails ?? [])
    .map((c) => {
      const otherId = c.participant_a === userId ? c.participant_b : c.participant_a;
      const p = profileById.get(otherId);
      const last = lastByConv.get(c.id);
      const unread = unreadByConv.get(c.id);
      const lastAt = last?.created_at ?? (c as { created_at?: string }).created_at ?? new Date(0).toISOString();
      return {
        id: c.id,
        otherId,
        otherNick: p?.nick ?? "?",
        otherAvatarUrl: p?.avatar_display_url ?? null,
        otherVerified: p?.verified ?? false,
        otherLastSeenAt: p?.last_seen_at ?? null,
        lastContent: last?.content ?? null,
        lastAt,
        hasUnread: (unread?.count ?? 0) > 0,
        unreadCount: unread?.count ?? 0,
        unreadLatestAt: unread?.latestAt ?? null,
      };
    })
    .sort((a, b) => {
      const aUnread = a.hasUnread ? (a.unreadLatestAt ?? a.lastAt) : "";
      const bUnread = b.hasUnread ? (b.unreadLatestAt ?? b.lastAt) : "";
      if (aUnread && bUnread) return bUnread > aUnread ? 1 : -1;
      if (a.hasUnread) return -1;
      if (b.hasUnread) return 1;
      return b.lastAt > a.lastAt ? 1 : -1;
    });

  return list;
}

export default async function NachrichtenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const list = await getConversationList(user.id);

  if (!list || list.length === 0) {
    return <>{children}</>;
  }

  return <MessagesLayoutClient list={list}>{children}</MessagesLayoutClient>;
}
