import { Crown, Link2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_ICONS = {
  Dom: Crown,
  Sub: Link2,
  Switcher: RefreshCw,
} as const;

export type RoleType = keyof typeof ROLE_ICONS;

export function RoleIcon({
  role,
  size = 16,
  className,
  "aria-hidden": ariaHidden = true,
}: {
  role: RoleType | string | null | undefined;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  const key = role && ROLE_ICONS[role as RoleType] ? (role as RoleType) : null;
  if (!key) return null;
  const Icon = ROLE_ICONS[key];
  return (
    <Icon
      className={cn("shrink-0 text-gray-400", className)}
      size={size}
      strokeWidth={1.5}
      aria-hidden={ariaHidden}
    />
  );
}
