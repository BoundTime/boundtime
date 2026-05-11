"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

type Profile = {
  id: string;
  nick: string | null;
  role: string | null;
  city: string | null;
  postal_code?: string | null;
  verified: boolean | null;
  last_seen_at?: string | null;
  avatarUrl?: string | null;
  created_at?: string | null;
};

type Props = {
  profile: Profile;
  isFollowing?: boolean;
};

const ROLE_COLORS: Record<string, string> = {
  Dom: "rgba(201,169,81,0.15)",
  Sub: "rgba(123,17,17,0.12)",
  Bull: "rgba(123,17,17,0.18)",
  Switcher: "rgba(140,80,200,0.12)",
  Hotwife: "rgba(200,80,140,0.12)",
};

function isOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

function isNew(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export function ProfileCard({ profile, isFollowing = false }: Props) {
  const router = useRouter();
  const initials = (profile.nick ?? "?")
    .split(/[\s_]+/)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const online = isOnline(profile.last_seen_at);
  const isNewMember = isNew(profile.created_at);
  const location = profile.city ?? profile.postal_code ?? null;

  function handleCardClick() {
    router.push(`/dashboard/entdecken/${profile.id}`);
  }

  function handleMessage(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/dashboard/nachrichten?with=${profile.id}`);
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/[0.08] hover:border-[rgba(123,17,17,0.4)] transition-[border-color] duration-200"
    >
      {/* Bild-Bereich */}
      <div className="relative overflow-hidden" style={{ height: 148 }}>
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-full w-full object-cover blur-sm group-hover:blur-0 transition-[filter] duration-300"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/70"
            style={{ background: ROLE_COLORS[profile.role ?? ""] ?? "rgba(123,17,17,0.12)" }}
          >
            {initials}
          </div>
        )}

        {/* Hover-Gradient-Layer */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,3,3,0.82) 0%, rgba(8,3,3,0.3) 55%, transparent 100%)",
          }}
        />

        {/* Badges oben links */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {profile.verified && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: "rgba(30,60,120,0.85)",
                color: "#91c0ff",
                border: "1px solid rgba(91,168,255,0.4)",
              }}
            >
              ✓ Verifiziert
            </span>
          )}
          {online && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: "rgba(10,60,30,0.85)",
                color: "#6ee7a0",
                border: "1px solid rgba(34,197,94,0.4)",
              }}
            >
              ● Online
            </span>
          )}
          {isNewMember && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: "rgba(100,75,10,0.85)",
                color: "#f0c060",
                border: "1px solid rgba(201,169,81,0.4)",
              }}
            >
              ★ Neu
            </span>
          )}
        </div>

        {/* Quick-Action Buttons (hover) */}
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-2 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-200 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={handleMessage}
            className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            style={{ background: "#7B1111" }}
          >
            Schreiben
          </button>
          {!isFollowing && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.55)",
              }}
            >
              Folgen
            </button>
          )}
        </div>
      </div>

      {/* Karten-Body */}
      <div className="px-3 pt-2.5 pb-3" style={{ background: "#141414" }}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[13px] font-medium text-white truncate">
            {profile.nick ?? "?"}
          </p>
          {location && (
            <p className="flex items-center gap-0.5 text-[11px] text-gray-500 shrink-0">
              <MapPin size={10} />
              {location}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {profile.role && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "rgba(123,17,17,0.1)", color: "#a06060", border: "1px solid rgba(123,17,17,0.15)" }}
            >
              {profile.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
