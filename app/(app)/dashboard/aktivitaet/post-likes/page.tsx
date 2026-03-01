import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { Heart } from "lucide-react";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";

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

export const dynamic = "force-dynamic";

export default async function AktivitaetPostLikesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myPosts } = await supabase
    .from("posts")
    .select("id, content")
    .eq("author_id", user.id);
  const myPostIds = (myPosts ?? []).map((p) => p.id);
  const postById = new Map((myPosts ?? []).map((p) => [p.id, p]));

  let list: { post_id: string; user_id: string; liked_at: string }[] = [];
  if (myPostIds.length > 0) {
    const { data } = await supabase
      .from("post_likes")
      .select("post_id, user_id, liked_at")
      .in("post_id", myPostIds)
      .order("liked_at", { ascending: false })
      .limit(100);
    list = (data ?? []) as { post_id: string; user_id: string; liked_at: string }[];
  }

  const userIds = Array.from(new Set(list.map((l) => l.user_id)));
  const { data: profilesData } = userIds.length > 0
    ? await supabase.from("profiles").select("id, nick, avatar_url, avatar_photo_id, last_seen_at, verified").in("id", userIds)
    : { data: [] };
  const profileById = new Map<
    string,
    { nick: string | null; avatar_display_url: string | null; last_seen_at: string | null; verified: boolean }
  >();
  if (profilesData?.length) {
    await Promise.all(
      profilesData.map(async (p) => {
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

  return (
    <Container className="py-16">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← MyBound
      </Link>

      <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card p-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Heart className="h-6 w-6 text-gray-400" />
          Wer hat deine Posts geliked
        </h1>
        <p className="mt-1 text-sm text-gray-400">Alle Likes auf deine Posts</p>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
        {list.length > 0 ? (
          <ul className="space-y-3">
            {list.map((l, i) => {
              const p = profileById.get(l.user_id);
              const post = postById.get(l.post_id);
              const snippet = post?.content
                ? (post.content.length > 50 ? post.content.slice(0, 50).trim() + "…" : post.content)
                : "deinen Post";
              const url = p?.avatar_display_url ?? null;
              return (
                <li key={`${l.post_id}-${l.user_id}-${i}`}>
                  <Link
                    href={`/dashboard/entdecken/${l.user_id}`}
                    className="flex items-center gap-4 rounded-xl border border-gray-700 bg-background/50 p-4 transition-colors hover:border-gray-600"
                  >
                    <AvatarWithVerified verified={p?.verified} size="md" className="h-12 w-12 shrink-0">
                    <div className="h-full w-full overflow-hidden rounded-full border border-gray-700 bg-background">
                      {url ? (
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                          {(p?.nick ?? "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    </AvatarWithVerified>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium text-white">
                        {p?.nick ?? "?"}
                        <OnlineIndicator lastSeenAt={p?.last_seen_at ?? null} variant="text" />
                      </p>
                      <p className="text-sm text-gray-400">
                        hat deinen Post geliked · {formatTimeAgo(new Date(l.liked_at))}
                      </p>
                      {post?.content && (
                        <p className="mt-0.5 truncate text-xs text-gray-500" title={post.content}>
                          „{snippet}"
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400">Noch hat niemand deine Posts geliked.</p>
        )}
      </div>
    </Container>
  );
}
