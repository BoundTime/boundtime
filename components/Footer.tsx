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
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/impressum"
              className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white"
            >
              <FileText className="h-4 w-4 shrink-0" />
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white"
            >
              <Shield className="h-4 w-4 shrink-0" />
              Datenschutz
            </Link>
            <Link
              href="/agb"
              className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white"
            >
              <ScrollText className="h-4 w-4 shrink-0" />
              AGB
            </Link>
            <Link
              href="/community-regeln"
              className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-150 hover:text-white"
            >
              <UsersRound className="h-4 w-4 shrink-0" />
              Community-Regeln
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
