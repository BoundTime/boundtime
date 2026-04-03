import Link from "next/link";
import { FileText, ScrollText, Shield, Sparkles, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mt-auto border-t border-amber-200/[0.08] bg-black/45 backdrop-blur-md ring-1 ring-white/[0.03]",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-9 pb-[max(2.25rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
          <p className="max-w-md text-center text-sm leading-relaxed text-gray-500 sm:text-left">
            © {new Date().getFullYear()} BoundTime – Cuckold Community
          </p>
          <nav className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:justify-end sm:gap-x-8">
            <Link
              href="/impressum"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg text-sm text-gray-400 transition-colors duration-200 hover:text-amber-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] motion-reduce:transition-none sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <FileText className="h-4 w-4 shrink-0" />
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg text-sm text-gray-400 transition-colors duration-200 hover:text-amber-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] motion-reduce:transition-none sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <Shield className="h-4 w-4 shrink-0" />
              Datenschutz
            </Link>
            <Link
              href="/agb"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg text-sm text-gray-400 transition-colors duration-200 hover:text-amber-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] motion-reduce:transition-none sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <ScrollText className="h-4 w-4 shrink-0" />
              AGB
            </Link>
            <Link
              href="/boundtime-features"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg text-sm text-gray-400 transition-colors duration-200 hover:text-amber-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] motion-reduce:transition-none sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              Boundtime- Features
            </Link>
            <Link
              href="/community-regeln"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg text-sm text-gray-400 transition-colors duration-200 hover:text-amber-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] motion-reduce:transition-none sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <UsersRound className="h-4 w-4 shrink-0" aria-hidden />
              Community-Regeln
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
