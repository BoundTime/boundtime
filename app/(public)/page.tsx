import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, HeartHandshake, UsersRound } from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

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
            <Link
              href="/"
              className="inline-block rounded-xl border border-gray-700/80 bg-card/50 p-4 shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <img
                src="/logo.jpg"
                alt="BoundTime – Logo"
                className="mx-auto h-auto w-40 sm:w-52 max-h-52 object-contain"
                width={240}
                height={240}
              />
            </Link>
            <h1 className="mt-8 text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              BoundTime – Community für Cuckoldpaare, Bulls, Femdoms & Slaves
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Eine deutschsprachige Cuckold-Community für Austausch, Dating, Vernetzung, Begegnung und Vertrauen – diskret und auf Augenhöhe.
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

      <section id="sicherheit" className="border-t border-gray-800 py-16">
        <Container>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md sm:p-6">
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
            <div className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md sm:p-6">
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
            <div className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md sm:p-6">
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
