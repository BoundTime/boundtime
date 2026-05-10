"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

export default function PasswortVergessenPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const baseUrl =
      typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL
        ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
        : window.location.origin;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailTrim, {
      redirectTo: `${baseUrl}/api/auth/callback?next=/passwort-vergessen/neu-setzen`,
    });

    setLoading(false);

    if (resetError) {
      if (resetError.message.toLowerCase().includes("rate limit")) {
        setError("Zu viele Anfragen. Bitte warte einige Minuten und versuche es erneut.");
      } else {
        setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      }
      return;
    }

    router.push(`/passwort-vergessen/bestaetigung?email=${encodeURIComponent(emailTrim)}`);
  }

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <PublicPageHeader
          title="Passwort vergessen"
          subtitle="Gib deine E-Mail-Adresse ein – wir schicken dir einen Link zum Zurücksetzen."
        />
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5 rounded-[1.25rem] border border-amber-200/10 bg-black/50 p-7 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] backdrop-blur-xl sm:p-8"
        >
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              placeholder="name@beispiel.de"
              autoComplete="email"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-amber-400/45 bg-amber-950/40 px-4 py-3 font-semibold text-amber-50 transition-[transform,background-color,border-color] duration-200 hover:border-amber-300/55 hover:bg-amber-950/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Bitte warten …" : "Reset-Link senden"}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-amber-200/85 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Anmeldung
          </Link>
        </form>
      </div>
    </Container>
  );
}
