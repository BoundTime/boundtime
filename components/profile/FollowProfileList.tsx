import Link from "next/link";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";
import type { FollowListProfileRow } from "@/lib/follow-list";

type Item = FollowListProfileRow & { avatarDisplayUrl: string | null };

export function FollowProfileList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Noch niemand hier.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li key={p.id}>
          <Link
            href={`/dashboard/entdecken/${p.id}`}
            className="flex min-h-[56px] items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
          >
            <AvatarWithVerified verified={p.verified} size="sm" className="h-10 w-10 shrink-0">
              <div className="h-full w-full overflow-hidden rounded-full border border-gray-700 bg-background">
                {p.avatarDisplayUrl ? (
                  <img src={p.avatarDisplayUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-accent">
                    {(p.nick ?? "?")
                      .split(/[\s_]+/)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>
            </AvatarWithVerified>
            <span className="min-w-0 flex-1 truncate font-medium text-white">{p.nick ?? "—"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
