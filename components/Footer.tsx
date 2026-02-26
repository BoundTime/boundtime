import Link from "next/link";
import { FileText, ScrollText, Shield, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-gray-800 bg-card mt-auto", className)}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} BoundTime – Community für diskrete BDSM-Kontakte.
          </p>
          <nav className="grid grid-cols-2 justify-items-center gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-6">
            <Link
              href="/impressum"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <FileText className="h-4 w-4 shrink-0" />
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <Shield className="h-4 w-4 shrink-0" />
              Datenschutz
            </Link>
            <Link
              href="/agb"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <ScrollText className="h-4 w-4 shrink-0" />
              AGB
            </Link>
            <Link
              href="/community-regeln"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <UsersRound className="h-4 w-4 shrink-0" />
              Community-Regeln
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
