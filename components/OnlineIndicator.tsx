"use client";

import {
  formatLastSeenDisplay,
  isProfileOnline,
  lastSeenAriaLabel,
} from "@/lib/last-seen";

export function OnlineIndicator({
  lastSeenAt,
  variant = "dot",
}: {
  lastSeenAt: string | null;
  variant?: "dot" | "text" | "both";
}) {
  const online = isProfileOnline(lastSeenAt);
  const aria = lastSeenAriaLabel(lastSeenAt);

  if (online) {
    return (
      <span className="inline-flex items-center gap-1 shrink-0" aria-label={aria}>
        {(variant === "dot" || variant === "both") && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
        )}
        {(variant === "text" || variant === "both") && (
          <span className="text-xs font-medium text-emerald-400">online</span>
        )}
      </span>
    );
  }

  if (variant === "dot") {
    return (
      <span
        className="inline-flex shrink-0 items-center"
        title={formatLastSeenDisplay(lastSeenAt)}
        aria-label={aria}
      >
        <span className="h-2 w-2 rounded-full bg-gray-600 ring-1 ring-gray-500/50" aria-hidden />
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 text-xs text-gray-500" aria-label={aria}>
      {formatLastSeenDisplay(lastSeenAt)}
    </span>
  );
}
