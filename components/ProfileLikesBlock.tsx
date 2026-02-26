"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

function getAvatarUrl(avatarPath: string | null): string | null {
  if (!avatarPath) return null;
  const { data } = createClient().storage.from("avatars").getPublicUrl(avatarPath);
  return data.publicUrl;
}

type LikeRow = { liker_id: string; liked_at: string };
type ProfileRow = { id: string; nick: string | null; avatar_url?: string | null; avatar_display_url?: string | null };

export function ProfileLikesBlock({
  likes,
  profiles,
  hideTitle,
}: {
  likes: LikeRow[];
  profiles: ProfileRow[];
  hideTitle?: boolean;
}) {
  const router = useRouter();
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const displayList = likes.slice(0, 4);
  const hasMore = likes.length > 4;

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={() => router.push("/dashboard/aktivitaet/profil-likes")}
      onKeyDown={(e) => e.key === "Enter" && router.push("/dashboard/aktivitaet/profil-likes")}
      className="cursor-pointer rounded-xl border border-gray-700 bg-card p-3 shadow-sm transition-colors hover:border-gray-600"
    >
      {!hideTitle && (
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Heart className="h-4 w-4" />
          Wer hat dein Profil geliked
        </h3>
      )}
      {displayList.length > 0 ? (
        <>
          <ul className="space-y-1">
            {displayList.map((l) => {
              const p = profileById.get(l.liker_id);
              const avatarUrl = p?.avatar_display_url ?? (p?.avatar_url ? getAvatarUrl(p.avatar_url) : null);
              return (
                <li key={`${l.liker_id}-${l.liked_at}`} onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/dashboard/entdecken/${l.liker_id}`}
                    className="flex items-center gap-2 rounded p-1.5 transition-colors hover:bg-background/50"
                  >
                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-700 bg-background">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-accent">
                          {(p?.nick ?? "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{p?.nick ?? "?"}</p>
                      <p className="text-[10px] text-gray-500">{formatTimeAgo(new Date(l.liked_at))}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {hasMore && (
            <p className="mt-1.5 text-xs text-accent hover:underline">
              Alle anzeigen ({likes.length - 4} weitere)
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500">Noch hat niemand dein Profil geliked.</p>
      )}
    </section>
  );
}
