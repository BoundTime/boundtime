import { VerifiedBadge } from "./VerifiedBadge";

/**
 * Wrapper für Avatar-Container: zeigt VerifiedBadge als Overlay unten rechts, wenn verified.
 * Badge-Größe skaliert mit Avatar-Größe (size "sm"|"md"|"lg").
 */
export function AvatarWithVerified({
  verified,
  size = "md",
  children,
  className = "",
}: {
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}) {
  const badgeSize = size === "sm" ? 10 : size === "md" ? 12 : 16;
  return (
    <div className={`relative ${className}`}>
      {children}
      {verified && (
      <span
        className="absolute bottom-0.5 right-0.5 rounded-full bg-background/90 p-0.5"
        title="Verifiziert"
      >
        <VerifiedBadge size={badgeSize} className="block text-accent" />
      </span>
      )}
    </div>
  );
}
