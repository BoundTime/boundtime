import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield, FileCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/Container";
import { PublicSectionHeading } from "@/components/public/PublicSectionHeading";
import { createClient } from "@/lib/supabase/server";
import { ExpiredLinkBanner } from "@/components/landing/ExpiredLinkBanner";
import { getSiteUrl, SITE_DESCRIPTION_DEFAULT, SITE_NAME, SITE_TITLE_DEFAULT } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE_DEFAULT },
  description: SITE_DESCRIPTION_DEFAULT,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION_DEFAULT,
    url: getSiteUrl(),
    images: [{ url: "/landing-brand-hero.png", alt: SITE_NAME }],
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const pillars = [
    {
      n: "01",
      title: "Orientierung",
      body: "Du erfährst, wie BoundTime aufgebaut ist – bevor du dich entscheidest.",
    },
    {
      n: "02",
      title: "Profil & Rollen",
      body: "Du legst ein Profil an, das zu dir passt – klar strukturiert und respektvoll.",
    },
    {
      n: "03",
      title: "Funktionen",
      body: "Werkzeuge für Absprachen und Vernetzung – immer im Rahmen der Community-Regeln.",
    },
    {
      n: "04",
      title: "Vertrauen",
      body: "Verifizierung und klare Regeln unterstützen einen verlässlichen Umgang.",
    },
  ];

  return (
    <>
      <ExpiredLinkBanner />

      <section className="relative overflow-hidden py-12 sm:py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),
                linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(180,140,60,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_60%,rgba(127,31,43,0.08),transparent_50%)]" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="relative mx-auto w-full max-w-[min(100%,28rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 blur-3xl sm:blur-[64px]"
                aria-hidden
              >
                <div className="h-[min(52vw,22rem)] w-[min(90vw,28rem)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(180,140,60,0.35)_0%,rgba(127,31,43,0.12)_45%,transparent_70%)] sm:h-80 sm:w-[32rem]" />
              </div>
              <Link
                href="/"
                className="relative mx-auto block aspect-[4/5] w-full min-h-[220px] max-h-[min(72vh,640px)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[280px] md:min-h-[340px] md:max-h-[min(68vh,680px)]"
              >
                <Image
                  src="/landing-brand-hero.png"
                  alt="BoundTime"
                  fill
                  className="object-contain object-center drop-shadow-[0_12px_48px_rgba(0,0,0,0.55)] [filter:drop-shadow(0_0_40px_rgba(180,140,60,0.12))]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 48rem"
                  priority
                />
              </Link>
            </div>

            <h1 className="mt-8 text-balance text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.35rem] md:leading-tight">
              BoundTime – deine deutschsprachige Community mit klaren Regeln
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-gray-400 sm:text-lg">
              Vernetzung, Austausch und Profile – diskret organisiert, mit Verifizierung und respektvollem Rahmen.
            </p>

            <div className="mx-auto mt-8 w-full max-w-xl rounded-2xl border border-amber-200/10 bg-black/40 px-5 py-5 text-left shadow-[0_24px_60px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04] backdrop-blur-sm sm:px-6 sm:text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/50">Einordnung</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-300 sm:text-[15px]">
                Für erwachsene Nutzerinnen und Nutzer, die einen <strong className="font-semibold text-gray-200">geschützten Rahmen</strong> für
                Vernetzung und Austausch suchen – mit klaren Rollen und moderierten Regeln.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-[15px]">
                BoundTime ist eine deutschsprachige Community mit Schwerpunkt{" "}
                <strong className="font-medium text-gray-300">Cuckolding und Wifesharing</strong>,{" "}
                <strong className="font-medium text-gray-300">Mensharing</strong> und strukturierter{" "}
                <strong className="font-medium text-gray-300">Keuschhaltung</strong> – für Paare, Einzelprofile,
                Bulls und weitere Rollen. Im Mittelpunkt stehen{" "}
                <strong className="font-medium text-gray-300">Vertrauen</strong>,{" "}
                <strong className="font-medium text-gray-300">Verifizierung</strong> und die{" "}
                <Link href="/community-regeln" className="text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline">
                  Community-Regeln
                </Link>
                ; es geht nicht um anonyme Schnellkontakte.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-[15px]">
                <Link
                  href="/boundtime-features#strenge-pruefung"
                  className="text-amber-200/80 underline-offset-2 hover:text-amber-100 hover:underline"
                >
                  Prüfprozess für Solomänner
                </Link>
                ,{" "}
                <Link href="/boundtime-features#cuckymode" className="text-amber-200/80 underline-offset-2 hover:text-amber-100 hover:underline">
                  Cuckymode für Paare
                </Link>{" "}
                und weitere Abläufe erklären wir sachlich unter{" "}
                <Link href="/boundtime-features" className="text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline">
                  Funktionen &amp; Ablauf
                </Link>
                .
              </p>
              <div
                className="my-4 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent"
                aria-hidden
              />
              <div className="flex flex-wrap justify-start gap-2 sm:justify-center">
                {["Paare & Cuckold-Profile", "Solos & Bulls", "Keuschhaltung & Rollen"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-gray-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-amber-400/45 bg-amber-950/35 px-8 py-3.5 text-center text-sm font-semibold text-amber-50 shadow-[0_16px_40px_-24px_rgba(180,140,60,0.35)] transition-[transform,background-color,border-color] duration-200 hover:border-amber-300/55 hover:bg-amber-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:transform-none sm:min-w-[200px]"
              >
                Kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-8 py-3.5 text-center text-sm font-medium text-gray-100 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-w-[160px]"
              >
                Anmelden
              </Link>
            </div>

            <p className="mt-4">
              <Link
                href="/boundtime-features#einordnung"
                className="text-sm font-medium text-amber-200/75 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
              >
                Welche Rollen und Themen?
              </Link>
            </p>

            <p className="mt-3">
              <Link
                href="/boundtime-features"
                className="text-sm font-medium text-amber-200/85 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
              >
                Was ist BoundTime? – Überblick &amp; Ablauf
              </Link>
            </p>

            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Link
                href="/community-regeln"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
              >
                <FileCheck className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                Community-Regeln
              </Link>
              <Link
                href="/boundtime-features"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                Funktionen &amp; Ablauf
              </Link>
              <Link
                href="/datenschutz"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
              >
                <Shield className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                Datenschutz
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.06] bg-black/20 py-12 sm:py-16 md:py-20">
        <Container>
          <PublicSectionHeading
            eyebrow="Ablauf"
            title="Vier Schritte zum Überblick"
            description="Kurz erklärt – ohne lange Textwände. Details und Begriffe findest du unter Funktionen & Ablauf."
            className="mb-2"
          />
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <Link
              href="/boundtime-features"
              className="font-medium text-amber-200/80 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
            >
              → Funktionen &amp; Ablauf
            </Link>
            <Link
              href="/community-regeln"
              className="font-medium text-amber-200/80 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
            >
              → Community-Regeln
            </Link>
          </div>
          <ol className="mx-auto mt-10 max-w-3xl space-y-0 border-l border-amber-400/25 pl-6 sm:pl-8">
            {pillars.map(({ n, title, body }) => (
              <li key={n} className="relative pb-10 last:pb-0">
                <span className="absolute -left-6 top-0 flex h-7 w-7 -translate-x-[calc(50%+0.5px)] items-center justify-center rounded-full border border-amber-400/35 bg-zinc-950 text-[10px] font-semibold text-amber-200/90 sm:-left-8 sm:h-8 sm:w-8 sm:text-xs">
                  {n}
                </span>
                <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-gray-400 sm:text-[15px]">{body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-white/[0.06] py-12 sm:py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[1.25rem] border border-amber-200/[0.1] bg-gradient-to-b from-black/50 to-black/70 p-8 text-center shadow-[0_32px_80px_-48px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] backdrop-blur-md sm:p-10 md:p-12">
            <p className="text-base leading-relaxed text-gray-300 sm:text-lg">
              Wenn dir Struktur, Respekt und klare Spielregeln wichtig sind, bist du hier richtig.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-amber-400/45 bg-amber-950/35 px-8 py-3.5 text-sm font-semibold text-amber-50 transition-colors hover:border-amber-300/55 hover:bg-amber-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:w-auto"
              >
                Jetzt registrieren
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              <Link href="/boundtime-features" className="text-amber-200/80 hover:text-amber-100 hover:underline">
                Mehr zu BoundTime lesen
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
