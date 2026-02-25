"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
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
  const supabase = createClient();
  const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
  return data.publicUrl;
}

type ViewRow = { viewer_id: string; viewed_at: string };
type ProfileRow = { id: string; nick: string | null; avatar_url: string | null };

export function ProfileViewsBlock({ hideTitle }: { hideTitle?: boolean } = {}) {
  const router = useRouter();
  const [views, setViews] = useState<ViewRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileRow>>(new Map());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const { data: viewsData, error: viewsError } = await supabase.rpc(
        "get_my_profile_views"
      );

      if (viewsError) {
        if (!cancelled) {
          setViews([]);
          setErrorMsg(viewsError.message);
        }
        setLoading(false);
        return;
      }
      if (cancelled) return;

      const list = Array.isArray(viewsData)
        ? (viewsData as ViewRow[])
        : [];
      setViews(list);
      setErrorMsg(null);

      const viewerIds = [...new Set(list.map((v) => v.viewer_id))];
      if (viewerIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, nick, avatar_url")
        .in("id", viewerIds);

      if (!cancelled) {
        setProfiles(new Map((profilesData ?? []).map((p) => [p.id, p])));
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-700 bg-card p-3 shadow-sm">
        {!hideTitle && (
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Eye className="h-4 w-4" />
            Wer hat dein Profil besucht
          </h3>
        )}
        <p className="text-xs text-gray-500">Wird geladen…</p>
      </section>
    );
  }

  const displayViews = views.slice(0, 4);
  const hasMore = views.length > 4;

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={() => router.push("/dashboard/aktivitaet/besucher")}
      onKeyDown={(e) => e.key === "Enter" && router.push("/dashboard/aktivitaet/besucher")}
      className="cursor-pointer rounded-xl border border-gray-700 bg-card p-3 shadow-sm transition-colors hover:border-gray-600"
    >
      {!hideTitle && (
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Eye className="h-4 w-4" />
          Wer hat dein Profil besucht
        </h3>
      )}
      {errorMsg ? (
        <p className="text-xs text-amber-400">Fehler: {errorMsg}</p>
      ) : displayViews.length > 0 ? (
        <>
          <ul className="space-y-1">
            {displayViews.map((v) => {
              const p = profiles.get(v.viewer_id);
              const avatarUrl = p?.avatar_url ? getAvatarUrl(p.avatar_url) : null;
              return (
                <li key={`${v.viewer_id}-${v.viewed_at}`} onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/dashboard/entdecken/${v.viewer_id}`}
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
                      <p className="text-[10px] text-gray-500">{formatTimeAgo(new Date(v.viewed_at))}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {hasMore && (
            <p className="mt-1.5 text-xs text-accent hover:underline">
              Alle anzeigen ({views.length - 4} weitere)
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500">
          Bisher hat noch niemand dein Profil angesehen.
        </p>
      )}
    </section>
  );
}
