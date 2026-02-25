import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({
  className,
  size = 14,
  showLabel = false,
}: {
  className?: string;
  size?: number;
  showLabel?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-accent", className)}
      title="Verifiziert"
    >
      <BadgeCheck size={size} strokeWidth={2} aria-hidden />
      {showLabel && <span className="text-xs font-medium">Verifiziert</span>}
    </span>
  );
}
