import { cn } from "@/lib/utils";

/** Lesbare Fläche für rechtliche & Info-Seiten: begrenzte Zeilenlänge, ruhige Typo */
export function PublicArticle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <article
      className={cn(
        "mx-auto max-w-3xl space-y-6 text-[15px] leading-[1.7] text-gray-300 md:text-base",
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-white",
        "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:first:mt-0",
        "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white",
        "[&_a]:text-amber-200/90 [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:text-amber-100",
        "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:text-gray-300",
        "[&_p]:text-gray-300",
        className
      )}
    >
      {children}
    </article>
  );
}
