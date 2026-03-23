import Link from "next/link";
import { Container } from "@/components/Container";
import { Mail, ArrowLeft } from "lucide-react";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";
export default async function RegisterCheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim() || null;

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[1.25rem] border border-amber-200/10 bg-black/50 p-8 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] backdrop-blur-xl sm:p-10">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/25 bg-amber-950/30">
          <Mail className="h-8 w-8 text-amber-200/90" aria-hidden />
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-white">
          E-Mail bestätigen
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-gray-400">
          Dein Konto ist angelegt. Öffne den Link in unserer E-Mail – danach kannst du dich anmelden.
        </p>
        <div className="mt-6 w-full space-y-4 rounded-xl border border-white/[0.08] bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-sm text-gray-300">
            <strong className="text-white">Bitte prüfe dein Postfach</strong> –
            wir haben dir einen Bestätigungslink geschickt.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-400 [&_strong]:text-gray-200">
            <li>Schau in deinem Posteingang nach</li>
            <li>
              Prüfe auch den <strong>Spam-</strong> oder{" "}
              <strong>Junk-Ordner</strong>
            </li>
          </ul>
          {email && (
            <p className="rounded-lg border border-amber-400/20 bg-amber-950/20 px-3 py-2 font-mono text-sm text-amber-100/90">
              Gesendet an: {email}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Du hast keine E-Mail erhalten? Prüfe auch deinen Spam-Ordner oder
            sende die Bestätigungs-E-Mail erneut:
          </p>
          <ResendVerificationButton email={email} />
        </div>
        <Link
          href="/login"
          className="mt-8 flex items-center gap-2 text-sm font-medium text-amber-200/85 transition-colors hover:text-amber-100 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Anmeldung
        </Link>
      </div>
    </Container>
  );
}
