import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, HeartHandshake, UsersRound, Info, Users } from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { CommunityRegelnTile } from "@/components/landing/CommunityRegelnTile";
import { ExpiredLinkBanner } from "@/components/landing/ExpiredLinkBanner";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <ExpiredLinkBanner />
      <section className="relative overflow-hidden py-12 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 -top-20"
          style={{
            background: "radial-gradient(ellipse 85% 55% at 50% -15%, rgba(122,31,43,0.22), transparent 60%)",
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
            <p className="mt-4 text-sm text-gray-400">
              Community für Cuckoldpaare, Bulls & mehr
            </p>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              BoundTime – Community für Cuckoldpaare, Bulls, Femdoms & Slaves
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Deutschsprachige Cuckold-Community für Austausch, Dating, Vernetzung, Begegnung und Vertrauen – diskret und auf Augenhöhe.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-accent px-6 py-3.5 text-center font-medium text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] sm:w-auto"
              >
                kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="w-full rounded-lg border border-gray-600 bg-card px-6 py-3.5 text-center font-medium text-white transition-all duration-200 ease-out hover:scale-[1.01] hover:border-gray-500 hover:bg-card/80 active:scale-[0.99] sm:w-auto"
              >
                Anmelden
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="community" className="border-t border-gray-800 py-8 sm:py-16">
        <Container>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article className="flex min-h-[200px] flex-col rounded-xl border border-gray-700 bg-card p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-12 sm:w-12">
                <Info className="h-5 w-5 text-accent sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="mt-3 sm:mt-4 text-base font-semibold leading-tight text-white sm:text-lg">
                Was ist BoundTime?
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">
                BoundTime ist die deutschsprachige Community für Cuckolding, Keuschhaltung und vernetzte Begegnung. Wir bieten einen diskreten Ort für Austausch, Dating und Vertrauen – mit Profilen, Nachrichten, Verifizierung und Features wie Keuschhaltungs-Vereinbarungen und BoundDollars. Seriös, auf Augenhöhe und mit Fokus auf Consent.
              </p>
              <p className="mt-3 text-sm text-gray-400">
                Mehr zu Begriffen, Regeln und zur <span className="text-accent font-medium">strengen Prüfung</span>{" "}
                findest du hier:{" "}
                <Link className="text-accent hover:underline" href="/boundtime-features">
                  boundtime-features
                </Link>
              </p>
            </article>
            <article className="flex min-h-[200px] flex-col rounded-xl border border-gray-700 bg-card p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-12 sm:w-12">
                <Users className="h-5 w-5 text-accent sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="mt-3 sm:mt-4 text-base font-semibold leading-tight text-white sm:text-lg">
                Für wen?
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">
                Cuckoldpaare, Bulls, Lover und Hausfreunde, Femdom-Solodamen, devote Solomänner auf der Suche nach Femdom oder Hotwife – alle, die in der Welt des Cuckolding leben oder sich ihr zugehörig fühlen, finden hier Vernetzung und Austausch.
              </p>
            </article>
            <article className="flex min-h-[200px] flex-col rounded-xl border border-gray-700 bg-card p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-12 sm:w-12">
                <ShieldCheck className="h-5 w-5 text-accent sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="mt-3 sm:mt-4 text-base font-semibold leading-tight text-white sm:text-lg">
                Sicherheit & Diskretion
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">
                Eure Daten und eure Privatsphäre stehen an erster Stelle. Wir setzen auf technische und organisatorische Maßnahmen, um Vertraulichkeit und eine sichere Nutzung zu gewährleisten.
              </p>
            </article>
            <article className="flex min-h-[200px] flex-col rounded-xl border border-gray-700 bg-card p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-12 sm:w-12">
                <HeartHandshake className="h-5 w-5 text-accent sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="mt-3 sm:mt-4 text-base font-semibold leading-tight text-white sm:text-lg">
                Consent & Respekt
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">
                Einverständnis und gegenseitiger Respekt sind die Grundlage unserer Community. Wir fördern einen achtsamen Umgang und klare Kommunikation zwischen allen Nutzerinnen und Nutzern.
              </p>
            </article>
            <article className="flex min-h-[200px] flex-col rounded-xl border border-gray-700 bg-card p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-12 sm:w-12">
                <UsersRound className="h-5 w-5 text-accent sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="mt-3 sm:mt-4 text-base font-semibold leading-tight text-white sm:text-lg">
                Community-Fokus
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">
                BoundTime ist ein Ort für Austausch und seriöse Kontakte. Im Mittelpunkt stehen Vertrauen, Information und der respektvolle Umgang innerhalb der Community.
              </p>
            </article>
            <CommunityRegelnTile />
          </div>
        </Container>
      </section>
    </>
  );
}
