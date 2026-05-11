import Link from "next/link";
import { type ComponentPropsWithoutRef } from "react";

type ButtonGhostProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

const sizeClasses = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3.5 text-base",
  lg: "px-9 py-4 text-lg",
};

export function ButtonGhost({
  href,
  size = "md",
  className = "",
  children,
  ...props
}: ButtonGhostProps) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 select-none
    border border-[var(--btn-ghost-border)] text-[var(--btn-ghost-text)]
    bg-transparent hover:bg-[var(--btn-ghost-bg-hover)] hover:border-[var(--border-default)]
    active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]
    ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} {...props}>
      {children}
    </button>
  );
}
