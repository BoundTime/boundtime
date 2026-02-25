import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";

export default async function NachrichtenPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const withUserId = params.with;

  if (withUserId && withUserId !== user.id) {
    const idA = user.id < withUserId ? user.id : withUserId;
    const idB = user.id < withUserId ? withUserId : user.id;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_a", idA)
      .eq("participant_b", idB)
      .maybeSingle();
    let convId: string;
    if (existing) {
      convId = existing.id;
    } else {
      const { data: inserted } = await supabase
        .from("conversations")
        .insert({ participant_a: idA, participant_b: idB })
        .select("id")
        .single();
      convId = inserted?.id ?? "";
    }
    if (convId) redirect(`/dashboard/nachrichten/${convId}`);
  }

  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`);
  const convIds = (convs ?? []).map((c) => c.id);

  if (convIds.length === 0) {
    return (
      <Container className="py-16">
        <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 hover:text-white">
          ← Start
        </Link>
        <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card p-6">
          <h1 className="text-2xl font-bold text-white">Nachrichten</h1>
          <p className="mt-1 text-sm text-gray-400">Deine Unterhaltungen</p>
        </div>
        <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
          <p className="text-gray-400">Noch keine Unterhaltungen.</p>
          <Link href="/dashboard/entdecken" className="mt-4 inline-block text-accent hover:underline">
            Entdecken →
          </Link>
        </div>
      </Container>
    );
  }

  const { data: lastMessages } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at, sender_id")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });
  const lastByConv = new Map<string | null, { content: string; created_at: string }>();
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
    otherIds.add(c.participant_a === user.id ? c.participant_b : c.participant_a);
  });
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nick, avatar_url")
    .in("id", Array.from(otherIds));
  const profileById = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const list = (convDetails ?? [])
    .map((c) => {
      const otherId = c.participant_a === user.id ? c.participant_b : c.participant_a;
      const p = profileById.get(otherId);
      const last = lastByConv.get(c.id);
      return {
        id: c.id,
        otherId,
        otherNick: p?.nick ?? "?",
        otherAvatarUrl: p?.avatar_url ?? null,
        lastContent: last?.content ?? null,
        lastAt: last?.created_at ?? (c as { created_at?: string }).created_at ?? new Date(0).toISOString(),
      };
    })
    .sort((a, b) => (b.lastAt > a.lastAt ? -1 : 1));

  return (
    <Container className="py-16">
      <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 hover:text-white">
        ← Start
      </Link>
      <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card p-6">
        <h1 className="text-2xl font-bold text-white">Nachrichten</h1>
        <p className="mt-1 text-sm text-gray-400">Deine Unterhaltungen</p>
      </div>
      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
        <ul className="space-y-3">
          {list.map((item) => {
            const avatarUrl = item.otherAvatarUrl
              ? supabase.storage.from("avatars").getPublicUrl(item.otherAvatarUrl).data.publicUrl
              : null;
            const initials = (item.otherNick ?? "?")
              .split(/[\s_]+/)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const preview = item.lastContent
              ? (item.lastContent.length > 60 ? item.lastContent.slice(0, 60) + "…" : item.lastContent)
              : "—";
            const timeStr = formatTimeAgo(new Date(item.lastAt));
            return (
              <li key={item.id}>
                <Link
                  href={`/dashboard/nachrichten/${item.id}`}
                  className="flex items-center gap-4 rounded-xl border border-gray-700 bg-background/50 p-4 transition-colors hover:border-gray-600"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-700 bg-background">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{item.otherNick}</p>
                    <p className="truncate text-sm text-gray-500">{preview}</p>
                  </div>
                  <p className="shrink-0 text-xs text-gray-500">{timeStr}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Container>
  );
}

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
