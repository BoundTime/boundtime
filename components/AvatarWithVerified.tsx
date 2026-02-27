import { VerifiedBadge } from "./VerifiedBadge";

type Position = "top-right" | "bottom-right";
type Variant = "subtle" | "prominent";

/**
 * Wrapper für Avatar-Container: zeigt VerifiedBadge als Overlay, wenn verified.
 * Badge-Größe skaliert mit Avatar-Größe (size "sm"|"md"|"lg").
 */
export function AvatarWithVerified({
  verified,
  size = "md",
  position = "bottom-right",
  variant = "subtle",
  children,
  className = "",
}: {
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  position?: Position;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  const badgeSize = size === "sm" ? 10 : size === "md" ? 12 : 16;
  const posClass = position === "top-right" ? "top-0.5 right-0.5" : "bottom-0.5 right-0.5";
  const isProminent = variant === "prominent";
  return (
    <div className={`relative ${className}`}>
      {children}
      {verified && (
        <span
          className={`absolute ${posClass} rounded-full p-0.5 ${
            isProminent ? "bg-accent shadow-lg shadow-accent/40" : "bg-background/90"
          }`}
          title="Verifiziert"
        >
          <VerifiedBadge
            size={badgeSize}
            className={`block ${isProminent ? "text-white" : "text-accent"}`}
          />
        </span>
      )}
    </div>
  );
}
