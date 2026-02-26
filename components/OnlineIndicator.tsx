"use client";

const ONLINE_MINUTES = 5;

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  const last = new Date(lastSeenAt).getTime();
  const now = Date.now();
  return (now - last) <= ONLINE_MINUTES * 60 * 1000;
}

export function OnlineIndicator({
  lastSeenAt,
  variant = "dot",
}: {
  lastSeenAt: string | null;
  variant?: "dot" | "text" | "both";
}) {
  if (!isOnline(lastSeenAt)) return null;

  return (
    <span className="inline-flex items-center gap-1 shrink-0" aria-label="Online">
      {(variant === "dot" || variant === "both") && (
        <span className="h-2 w-2 rounded-full bg-green-500" />
      )}
      {(variant === "text" || variant === "both") && (
        <span className="text-xs text-green-500">online</span>
      )}
    </span>
  );
}
