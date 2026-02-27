import { VerificationTierBadge, type VerificationTier } from "./VerificationTierBadge";

type Position = "top-right" | "bottom-right";
type Variant = "subtle" | "prominent";

/** Styling je nach Tier: Bronze dezent, Silber sichtbar, Gold hervorgehoben */
function getTierOverlayClasses(tier: VerificationTier, variant: Variant): string {
  const base = "rounded-full p-0.5";
  if (variant === "prominent" || tier === "gold") {
    return `${base} bg-accent shadow-lg shadow-accent/40`;
  }
  if (tier === "silver") {
    return `${base} bg-slate-600/95`;
  }
  return `${base} bg-background/90`;
}

/**
 * Wrapper für Avatar-Container: zeigt VerificationTierBadge als Overlay.
 * Unterstützt verificationTier (Bronze/Silber/Gold) oder verified (Fallback → Gold).
 */
export function AvatarWithVerified({
  verificationTier,
  verified,
  size = "md",
  position = "bottom-right",
  variant = "subtle",
  children,
  className = "",
}: {
  verificationTier?: VerificationTier | null;
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  position?: Position;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  const tier: VerificationTier | null =
    verificationTier ?? (verified ? "gold" : null);
  const badgeSize = size === "sm" ? 10 : size === "md" ? 12 : 16;
  const posClass = position === "top-right" ? "top-0.5 right-0.5" : "bottom-0.5 right-0.5";

  if (!tier) return <div className={`relative ${className}`}>{children}</div>;

  const overlayClasses = getTierOverlayClasses(tier, variant);
  const iconClass =
    tier === "gold"
      ? "text-white"
      : tier === "silver"
        ? "text-white"
        : "text-amber-400";

  return (
    <div className={`relative ${className}`}>
      {children}
      <span
        className={`absolute ${posClass} ${overlayClasses}`}
        title={
          tier === "gold"
            ? "Verifiziert"
            : tier === "silver"
              ? "Profil bestätigt"
              : "Bronze"
        }
      >
        <VerificationTierBadge
          tier={tier}
          size={badgeSize}
          className={`block ${iconClass}`}
        />
      </span>
    </div>
  );
}
