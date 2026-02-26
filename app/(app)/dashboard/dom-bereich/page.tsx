import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";

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

export default async function DomBereichPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role, verified")
    .eq("id", user.id)
    .single();

  const isDomOrSwitcher = myProfile?.role === "Dom" || myProfile?.role === "Switcher";
  const isVerified = myProfile?.verified ?? false;

  if (!isDomOrSwitcher || !isVerified) {
    return (
      <Container className="py-16">
        <div className="rounded-xl border border-gray-700 bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-white">Dom(me)-Bereich</h1>
          <p className="mt-4 text-gray-400">
            Dieser Bereich ist nur für verifizierte Mitglieder mit der Rolle Dom oder Switcher zugänglich.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Bitte verifiziere dein Konto und stelle sicher, dass deine Rolle Dom oder Switcher ist.
          </p>
          <Link href="/dashboard" className="mt-6 inline-block text-accent hover:underline">
            ← Zurück zum Start
          </Link>
        </div>
      </Container>
    );
  }

  const { data: domProfileIds } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["Dom", "Switcher"])
    .eq("verified", true);
  const ids = domProfileIds?.map((p) => p.id) ?? [];

  let posts: Array<{
    id: string;
    author_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    author_nick: string | null;
    author_avatar_url: string | null;
  }> = [];

  if (ids.length > 0) {
    const { data: postsData } = await supabase
      .from("posts")
      .select("id, author_id, content, image_url, created_at")
      .in("author_id", ids)
      .order("created_at", { ascending: false })
      .limit(50);
    if (postsData?.length) {
      const authorIds = Array.from(new Set(postsData.map((p) => p.author_id)));
      const { data: authors } = await supabase
        .from("profiles")
        .select("id, nick, avatar_url, avatar_photo_id")
        .in("id", authorIds);
      const authorById = new Map(authors?.map((a) => [a.id, a]) ?? []);
      posts = await Promise.all(
        postsData.map(async (p) => {
          const a = authorById.get(p.author_id);
          const avatarUrl = a
            ? await resolveProfileAvatarUrl(
                { avatar_url: a.avatar_url, avatar_photo_id: a.avatar_photo_id },
                supabase
              )
            : null;
          return {
            ...p,
            author_nick: a?.nick ?? null,
            author_avatar_url: avatarUrl,
          };
        })
      );
    }
  }

  return (
    <Container className="py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Dom(me)-Bereich</h1>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
          ← Start
        </Link>
      </div>
      <p className="mb-6 text-gray-400">
        Austausch und Timeline nur von verifizierten Dom(me)s. Nur für verifizierte Mitglieder mit Rolle Dom oder Switcher sichtbar.
      </p>

      {posts.length > 0 ? (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="overflow-hidden rounded-xl border border-gray-700 bg-card shadow-sm"
            >
              <div className="flex items-center gap-4 p-4">
                <Link href={`/dashboard/entdecken/${post.author_id}`} className="shrink-0">
                  <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-700 bg-background">
                    {post.author_avatar_url ? (
                      <img src={post.author_avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-base font-semibold text-accent">
                        {(post.author_nick ?? "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/entdecken/${post.author_id}`}
                      className="font-medium text-white hover:text-accent"
                    >
                      {post.author_nick ?? "?"}
                    </Link>
                    <VerifiedBadge size={14} />
                  </span>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(new Date(post.created_at))}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-700 px-4 pb-4 pt-1">
                <p className="whitespace-pre-wrap text-gray-300">{post.content}</p>
                {post.image_url && (
                  <div className="mt-4 overflow-hidden rounded-lg">
                    <img
                      src={supabase.storage.from("post-images").getPublicUrl(post.image_url).data.publicUrl}
                      alt=""
                      className="max-h-[28rem] w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-gray-700 bg-card p-8 text-center shadow-sm">
          <p className="text-gray-400">Noch keine Beiträge von verifizierten Dom(me)s.</p>
          <p className="mt-2 text-sm text-gray-500">Verifizierte Dom(me)s können hier posten; die Beiträge erscheinen in diesem Bereich.</p>
        </div>
      )}
    </Container>
  );
}
