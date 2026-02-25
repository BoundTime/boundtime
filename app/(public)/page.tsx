import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, HeartHandshake, UsersRound } from "lucide-react";
import { Container } from "@/components/Container";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 -top-20"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(122,31,43,0.15), transparent)",
          }}
        />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-lg">
              <Image
                src="/logo.png"
                alt="BoundTime – Logo"
                width={320}
                height={120}
                className="mx-auto h-auto w-64 sm:w-80 mix-blend-lighten"
                priority
              />
            </Link>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              BoundTime – Netzwerk für diskrete und respektvolle BDSM-Kontakte
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Eine deutschsprachige Community für Austausch, Begegnung und
              Vertrauen. Für alle Rollen und Geschlechter – diskret und auf Augenhöhe.
            </p>
            <p className="mt-3 text-base text-gray-400">
              Keuschhaltung mit Aufgaben und Belohnungen: gemeinsam vereinbaren und umsetzen.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-accent px-6 py-3.5 text-center font-medium text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] sm:w-auto"
              >
                Jetzt registrieren
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

      <section id="keuschhaltung" className="border-t border-gray-800 py-12">
        <Container>
          <div className="rounded-xl border border-gray-700 bg-card p-8 text-center shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
            <h2 className="text-xl font-semibold text-white">Keuschhaltung</h2>
            <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
              Vereinbaren Sie mit einer Person Ihrer Wahl Keuschhaltung inklusive Aufgaben, BoundDollars und Belohnungskatalog – für alle, die diese Dynamik leben möchten.
            </p>
            <div className="mt-6">
              <Link
                href="/register"
                className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98]"
              >
                Jetzt registrieren
              </Link>
              <span className="mx-2 text-gray-500">oder</span>
              <Link
                href="/login"
                className="inline-block rounded-lg border border-gray-600 px-5 py-2.5 text-sm text-gray-300 transition-all duration-200 hover:scale-[1.01] hover:border-gray-500 hover:bg-card active:scale-[0.99]"
              >
                Anmelden
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="sicherheit" className="border-t border-gray-800 py-16">
        <Container>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <ShieldCheck className="h-8 w-8 text-accent" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-3 text-lg font-semibold text-white">
                Sicherheit & Diskretion
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                Ihre Daten und Ihre Privatsphäre stehen an erster Stelle. Wir
                setzen auf technische und organisatorische Maßnahmen, um
                Vertraulichkeit und sichere Nutzung zu gewährleisten.
              </p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <HeartHandshake className="h-8 w-8 text-accent" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-3 text-lg font-semibold text-white">
                Consent & Respekt
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                Einverständnis und gegenseitiger Respekt sind die Grundlage
                unserer Community. Wir fördern einen achtsamen Umgang und klare
                Kommunikation zwischen allen Nutzerinnen und Nutzern.
              </p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
              <UsersRound className="h-8 w-8 text-accent" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-3 text-lg font-semibold text-white" id="community">
                Community-Fokus
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                BoundTime ist ein Ort für Austausch und seriöse Kontakte. Im
                Mittelpunkt stehen Vertrauen, Information und der respektvolle
                Umgang innerhalb der Community.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
