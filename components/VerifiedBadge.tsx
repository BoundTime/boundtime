import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({
  size = 14,
  showLabel = false,
  className,
}: {
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-blue-500", className)}
      title="Verifiziert"
    >
      <BadgeCheck size={size} strokeWidth={2} aria-hidden />
      {showLabel && <span className="text-xs font-medium">Verifiziert</span>}
    </span>
  );
}
