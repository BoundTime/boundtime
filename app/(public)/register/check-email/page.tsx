import Link from "next/link";
import { Container } from "@/components/Container";
import { Mail, ArrowLeft } from "lucide-react";

export default async function RegisterCheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim() || null;

  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-gray-700 bg-card p-8 shadow-sm">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
          <Mail className="h-8 w-8 text-accent" aria-hidden />
        </div>
        <h1 className="text-center text-2xl font-semibold text-white">
          E-Mail zur Bestätigung prüfen
        </h1>
        <p className="mt-4 text-center text-gray-300">
          Dein Konto wurde angelegt. Damit du dich anmelden kannst, musst du
          zuerst deine E-Mail-Adresse bestätigen.
        </p>
        <div className="mt-6 w-full space-y-4 rounded-lg bg-gray-800/50 p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-white">Bitte prüfe dein Postfach</strong> –
            wir haben dir einen Bestätigungslink geschickt.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-400">
            <li>Schau in deinem Posteingang nach</li>
            <li>Prüfe auch den <strong>Spam-</strong> oder{" "}
              <strong>Junk-Ordner</strong>
            </li>
          </ul>
          {email && (
            <p className="rounded border border-gray-600 bg-gray-900/50 px-3 py-2 font-mono text-sm text-accent">
              Gesendet an: {email}
            </p>
          )}
        </div>
        <Link
          href="/login"
          className="mt-8 flex items-center gap-2 text-sm text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Anmeldung
        </Link>
      </div>
    </Container>
  );
}
