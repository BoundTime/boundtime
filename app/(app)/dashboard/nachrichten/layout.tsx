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

  const { data: lastMessages } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });
  const lastByConv = new Map<string, { content: string; created_at: string }>();
  (lastMessages ?? []).forEach((m) => {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, { content: m.content, created_at: m.created_at });
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
    .select("id, nick, avatar_url, avatar_photo_id, last_seen_at, verification_tier")
    .in("id", Array.from(otherIds));
  const profileById = new Map<string, { nick: string | null; avatar_display_url: string | null; last_seen_at: string | null; verification_tier: "bronze" | "silver" | "gold" }>();
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
          verification_tier: (p.verification_tier as "bronze" | "silver" | "gold") ?? "bronze",
        });
      })
    );
  }

  const list = (convDetails ?? [])
    .map((c) => {
      const otherId = c.participant_a === userId ? c.participant_b : c.participant_a;
      const p = profileById.get(otherId);
      const last = lastByConv.get(c.id);
      return {
        id: c.id,
        otherId,
        otherNick: p?.nick ?? "?",
        otherAvatarUrl: p?.avatar_display_url ?? null,
        otherVerificationTier: p?.verification_tier ?? "bronze",
        otherLastSeenAt: p?.last_seen_at ?? null,
        lastContent: last?.content ?? null,
        lastAt: last?.created_at ?? (c as { created_at?: string }).created_at ?? new Date(0).toISOString(),
      };
    })
    .sort((a, b) => (b.lastAt > a.lastAt ? 1 : -1));

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
