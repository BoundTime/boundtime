import { cn } from "@/lib/utils";

/**
 * Einheitliche Section-Köpfe für öffentliche Seiten (Landing, Features, Regeln).
 */
export function PublicSectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        align === "left" && "text-left",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/50">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2>
      {description ? <p className="mt-2 text-sm text-gray-500 sm:text-[15px]">{description}</p> : null}
      <div
        className={cn(
          "mt-5 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent",
          align === "center" && "mx-auto max-w-xs",
          align === "left" && "max-w-xs"
        )}
        aria-hidden
      />
    </div>
  );
}
