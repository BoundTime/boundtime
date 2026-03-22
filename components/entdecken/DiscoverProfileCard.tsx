import Image from "next/image";
import Link from "next/link";
import { RoleIcon } from "@/components/RoleIcon";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export type DiscoverProfileCardProfile = {
  id: string;
  nick: string | null;
  role: string | null;
  gender: string | null;
  account_type?: string | null;
  postal_code?: string | null;
  city?: string | null;
  verified: boolean | null;
  last_seen_at?: string | null;
  avatarUrl?: string | null;
};

type Props = {
  profile: DiscoverProfileCardProfile;
};

export function DiscoverProfileCard({ profile }: Props) {
  const avatarUrl = profile.avatarUrl ?? null;
  const initials = (profile.nick ?? "?")
    .split(/[\s_]+/)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const isVerifiedDom = profile.verified && (profile.role === "Dom" || profile.role === "Switcher");
  const location = [profile.postal_code, profile.city].filter(Boolean).join(" ");

  return (
    <Link
      href={`/dashboard/entdecken/${profile.id}`}
      className={`group relative flex min-h-[44px] flex-col overflow-hidden rounded-xl border bg-black/35 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.85)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transition-none ${
        isVerifiedDom
          ? "border-amber-400/25 hover:border-amber-300/40 hover:shadow-[0_22px_48px_-26px_rgba(180,140,60,0.12)]"
          : "border-white/[0.08] hover:border-white/20 hover:shadow-[0_22px_48px_-28px_rgba(0,0,0,0.75)]"
      } hover:-translate-y-0.5 motion-reduce:hover:translate-y-0`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay" aria-hidden style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
      }} />
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
        <AvatarWithVerified verified={!!profile.verified} size="lg" position="top-right" className="absolute inset-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill className="object-cover" sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-amber-200/80">
              {initials}
            </span>
          )}
        </AvatarWithVerified>
        <span className="absolute bottom-2 right-2 rounded-full border border-white/10 bg-black/50 p-0.5 backdrop-blur-sm">
          <OnlineIndicator lastSeenAt={profile.last_seen_at ?? null} variant="dot" />
        </span>
      </div>
      <div className="relative flex flex-col gap-1 border-t border-white/[0.06] bg-black/25 px-3 py-3 sm:px-3.5 sm:py-3.5">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <span className="min-w-0 truncate">{profile.nick ?? "?"}</span>
          {profile.verified ? (
            <VerifiedBadge size={11} className="shrink-0 text-amber-400/85 opacity-95" />
          ) : null}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <RoleIcon role={profile.role} size={11} className="shrink-0 text-gray-500" />
          <span className="min-w-0 truncate">
            {profile.role ?? "—"} · {profile.account_type === "couple" ? "Paar" : profile.gender ?? "—"}
          </span>
        </p>
        {location ? <p className="truncate text-xs text-gray-500">{location}</p> : null}
      </div>
    </Link>
  );
}
