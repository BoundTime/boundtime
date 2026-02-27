import { BadgeCheck, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationTier = "bronze" | "silver" | "gold";

const TIER_CONFIG: Record<
  VerificationTier,
  { label: string; tooltip: string; icon: typeof BadgeCheck | typeof Medal; className: string }
> = {
  bronze: {
    label: "Bronze",
    tooltip: "Bronze – E-Mail bestätigt",
    icon: Medal,
    className: "text-amber-400",
  },
  silver: {
    label: "Silber",
    tooltip: "Silber – Profil bestätigt (≥80% ausgefüllt)",
    icon: Medal,
    className: "text-slate-400",
  },
  gold: {
    label: "Verifiziert",
    tooltip: "Gold – Identität per Ausweis bestätigt",
    icon: BadgeCheck,
    className: "text-accent",
  },
};

export function VerificationTierBadge({
  tier,
  size = 14,
  showLabel = false,
  className,
}: {
  tier: VerificationTier;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  return (
    <span
      className={cn("inline-flex items-center gap-1", config.className, className)}
      title={config.tooltip}
    >
      <Icon size={size} strokeWidth={2} aria-hidden />
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </span>
  );
}
