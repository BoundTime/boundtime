import Link from "next/link";
import { type ComponentPropsWithoutRef } from "react";

type ButtonPrimaryProps = {
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

export function ButtonPrimary({
  href,
  size = "md",
  className = "",
  children,
  ...props
}: ButtonPrimaryProps) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 select-none
    bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]
    hover:bg-[var(--btn-primary-bg-hover)] hover:shadow-[0_0_20px_rgba(123,17,17,0.45)]
    active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-crimson)]
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
