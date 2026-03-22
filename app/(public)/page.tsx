import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  HeartHandshake,
  UsersRound,
  Info,
  Users,
} from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { CommunityRegelnTile } from "@/components/landing/CommunityRegelnTile";
import { ExpiredLinkBanner } from "@/components/landing/ExpiredLinkBanner";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const steps = [
    {
      num: "01",
      heading: "Was ist BoundTime?",
      body: "Deutschsprachige Community für Cuckolding, Keuschhaltung und Vernetzung – diskret, mit Verifizierung und Regeln.",
    },
    {
      num: "02",
      heading: "Für wen?",
      body: "Cuckoldpaare, Bulls, Femdom-Solodamen, devote Solomänner – alle, die dazugehören, finden hier Vernetzung und Austausch.",
    },
    {
      num: "03",
      heading: "Features im Alltag",
      body: "Verifizierung, Keuschhaltungs-Vereinbarungen und BoundDollars unterstützen euren Alltag.",
    },
    {
      num: "04",
      heading: "Vertrauen & Sicherheit",
      body: "Strenge Prüfung und klare Regeln schaffen Vertrauen und Sicherheit für alle.",
    },
  ];

  const featureCards = [
    {
      title: "Was ist BoundTime?",
      icon: Info,
      body: "Community für Cuckolding, Keuschhaltung und Vernetzung – diskret, mit Verifizierung und Fokus auf Consent.",
      href: "/boundtime-features",
    },
    {
      title: "Für wen?",
      icon: Users,
      body: "Cuckoldpaare, Bulls, Lover, Femdom-Solodamen, devote Solomänner – Vernetzung und Austausch auf Augenhöhe.",
      href: "/boundtime-features",
    },
    {
      title: "Sicherheit & Diskretion",
      icon: ShieldCheck,
      body: "Daten und Privatsphäre an erster Stelle – technische und organisatorische Maßnahmen für Vertraulichkeit.",
      href: "/datenschutz",
    },
    {
      title: "Consent & Respekt",
      icon: HeartHandshake,
      body: "Einverständnis und Respekt als Grundlage – achtsamer Umgang und klare Kommunikation.",
      href: "/community-regeln",
    },
    {
      title: "Community-Fokus",
      icon: UsersRound,
      body: "Ort für Austausch und seriöse Kontakte – Vertrauen, Information und respektvoller Umgang.",
      href: "/boundtime-features",
    },
  ];

  return (
    <>
      <ExpiredLinkBanner />

      {/* A) Hero */}
      <section className="relative overflow-hidden py-10 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 -top-20"
          style={{
            background:
              "radial-gradient(ellipse 85% 55% at 50% -15%, rgba(122,31,43,0.22), transparent 60%)",
          }}
        />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/"
              className="inline-block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background focus:rounded-xl rounded-xl"
            >
              <img
                src="/logo.jpg"
                alt="BoundTime – Logo"
                className="mx-auto h-auto w-48 sm:w-64 lg:w-72 max-h-72 object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                width={288}
                height={288}
              />
            </Link>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              BoundTime – Community für Cuckoldpaare, Bulls, Femdoms & Slaves
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-300">
              Deutschsprachige Cuckold-Community für Austausch, Dating, Vernetzung – diskret und auf Augenhöhe.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-xl bg-accent px-6 py-3.5 text-center font-medium text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] sm:w-auto"
              >
                kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-gray-600 bg-card px-6 py-3.5 text-center font-medium text-white transition-all duration-200 ease-out hover:scale-[1.01] hover:border-gray-500 hover:bg-card/80 active:scale-[0.99] sm:w-auto"
              >
                Anmelden
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              <Link href="/boundtime-features" className="text-accent hover:underline">
                Was sind Boundtime- Features?
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {/* B) In 4 Schritten verstanden */}
      <section className="border-t border-gray-800 py-10 sm:py-16">
        <Container>
          <h2 className="text-center text-xl font-bold text-white sm:text-2xl">
            In 4 Schritten verstanden
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {steps.map(({ num, heading, body }) => (
              <article
                key={num}
                className="flex flex-col rounded-2xl border border-gray-700 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md sm:p-6"
              >
                <span className="text-xs font-mono text-accent sm:text-sm">{num}</span>
                <h3 className="mt-2 text-base font-semibold leading-tight text-white sm:text-lg">
                  {heading}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* C) Feature-Card Grid */}
      <section id="community" className="border-t border-gray-800 py-10 sm:py-16">
        <Container>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map(({ title, icon: Icon, body, href }) => (
              <article
                key={title}
                className="flex min-h-[200px] flex-col rounded-2xl border border-gray-700 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-600 hover:shadow-md sm:p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 sm:h-12 sm:w-12">
                  <Icon
                    className="h-5 w-5 text-accent sm:h-6 sm:w-6"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
                <h2 className="mt-3 sm:mt-4 text-base font-semibold leading-tight text-white sm:text-lg">
                  {title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400 line-clamp-3">
                  {body}
                </p>
                <p className="mt-3">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
                  >
                    Mehr erfahren
                  </Link>
                </p>
              </article>
            ))}
            <CommunityRegelnTile />
          </div>
        </Container>
      </section>

      {/* D) Abschlussbanner */}
      <section className="border-t border-gray-800 py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-700 bg-card p-8 text-center shadow-lg sm:p-10">
            <p className="text-base text-gray-300 sm:text-lg">
              Diskret, auf Augenhöhe – mit Verifizierung und klaren Regeln. Starte jetzt.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="w-full rounded-xl bg-accent px-6 py-3.5 text-center font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] sm:w-auto"
              >
                kostenlos registrieren
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              <Link href="/boundtime-features" className="text-accent hover:underline">
                Was sind Boundtime- Features?
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
