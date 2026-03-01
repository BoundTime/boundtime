import { BadgeCheck } from "lucide-react";

type Position = "top-right" | "bottom-right";

/**
 * Wrapper für Avatar-Container: zeigt blauen Verifizierungs-Haken, wenn verified.
 */
export function AvatarWithVerified({
  verified,
  size = "md",
  position = "bottom-right",
  children,
  className = "",
}: {
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  position?: Position;
  children: React.ReactNode;
  className?: string;
}) {
  if (!verified) return <div className={`relative ${className}`}>{children}</div>;

  const badgeSize = size === "sm" ? 10 : size === "md" ? 12 : 16;
  const posClass = position === "top-right" ? "top-0.5 right-0.5" : "bottom-0.5 right-0.5";

  return (
    <div className={`relative ${className}`}>
      {children}
      <span
        className={`absolute ${posClass} rounded-full bg-blue-500 p-0.5 shadow-lg`}
        title="Verifiziert"
      >
        <BadgeCheck size={badgeSize} className="text-white" strokeWidth={2} aria-hidden />
      </span>
    </div>
  );
}
