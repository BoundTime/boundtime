import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ChastityCatalogManager } from "@/components/chastity/ChastityCatalogManager";
import { SettingsAccountSection } from "@/components/settings/SettingsAccountSection";
import { SettingsSessionsSection } from "@/components/settings/SettingsSessionsSection";
import { SettingsBlockedUsersSection } from "@/components/settings/SettingsBlockedUsersSection";
import { SettingsRestrictionSection } from "@/components/settings/SettingsRestrictionSection";

export default async function EinstellungenPage({
  searchParams,
}: {
  searchParams: Promise<{ cuckymode_reset?: string }>;
}) {
  const params = await searchParams;
  const showCuckymodeResetSuccess = params.cuckymode_reset === "ok";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_type, is_admin")
    .eq("id", user.id)
    .single();

  const isDomOrSwitcher =
    profile?.role === "Dom" || profile?.role === "Switcher";
  const isAdmin = profile?.is_admin ?? false;

  return (
    <Container className="py-10 md:py-14">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 transition-colors hover:text-white">
          ← Zurück zu MyBound
        </Link>
      </div>

      <header className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1f1f1f] to-[#151515] p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-white md:text-3xl">Einstellungen</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:w-auto sm:grid-cols-3">
            <a href="#privatsphaere-schutz" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-gray-200 transition-colors hover:bg-white/10">Privatsphäre</a>
            {profile?.account_type === "couple" && (
              <a href="#cuckymode-steuerung" className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-center text-amber-100 transition-colors hover:bg-amber-300/20">Cuckymode</a>
            )}
            {(isDomOrSwitcher || isAdmin) && (
              <a href="#rollenwerkzeuge" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-gray-200 transition-colors hover:bg-white/10">Werkzeuge</a>
            )}
            <a href="#zugang-konto" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-gray-200 transition-colors hover:bg-white/10">Zugang</a>
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-5 md:space-y-6">
        <section id="privatsphaere-schutz" className="rounded-2xl border border-white/10 bg-card/95 p-5 md:p-6">
          <div className="mb-4 border-b border-white/10 pb-4">
            <div className="mb-2 inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
              Privatsphäre &amp; Schutz
            </div>
            <h2 className="text-lg font-semibold text-white">Unerwünschte Kontakte</h2>
            <p className="mt-1 text-sm text-gray-400">
              Du blockierst Profile und entscheidest, wer dir nicht mehr schreiben kann.
            </p>
          </div>
          <SettingsBlockedUsersSection />
        </section>

        {profile?.account_type === "couple" && (
          <section id="cuckymode-steuerung" className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5 md:p-6">
            <div className="mb-4 border-b border-amber-500/20 pb-4">
              <div className="mb-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200">
                Cuckymode-Steuerung
              </div>
              <h2 className="text-lg font-semibold text-white">Cuckymode steuern</h2>
              <p className="mt-1 text-sm text-amber-100/80">
                Du passt Regeln an, sicherst mit dem Paarpasswort ab und kannst den Modus bei Bedarf zurücksetzen.
              </p>
            </div>
            <SettingsRestrictionSection showResetSuccess={showCuckymodeResetSuccess} />
          </section>
        )}

        {(isDomOrSwitcher || isAdmin) && (
          <section id="rollenwerkzeuge" className="rounded-2xl border border-white/10 bg-card/95 p-5 md:p-6">
            <div className="mb-4 border-b border-white/10 pb-4">
              <div className="mb-2 inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                Rollenbasierte Werkzeuge
              </div>
              <h2 className="text-lg font-semibold text-white">Rollenwerkzeuge</h2>
              <p className="mt-1 text-sm text-gray-400">
                Diese Bereiche siehst du nur mit passender Rolle – damit nichts Versehentliches ausgelöst wird.
              </p>
            </div>
            <div className="space-y-5">
              {isDomOrSwitcher ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
                  <h3 className="text-sm font-semibold text-white">Belohnungskatalog</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Du pflegst die Belohnungen, die du Subs in laufenden Arrangements anbieten kannst.
                  </p>
                  <div className="mt-4">
                    <ChastityCatalogManager domId={user.id} embedded />
                  </div>
                </div>
              ) : null}
              {isAdmin ? (
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-4 md:p-5">
                  <h3 className="text-sm font-semibold text-white">Admin-Steuerung</h3>
                  <p className="mt-1 text-sm text-amber-100/80">
                    Du prüfst Verifizierungen und bearbeitest Meldungen zu Bull-Profilen.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard/admin/verifikationen"
                      className="inline-flex items-center rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20"
                    >
                      Verifikationen prüfen
                    </Link>
                    <Link
                      href="/dashboard/admin/beanstandungen"
                      className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
                    >
                      Beanstandungen (Bull)
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}

        <section id="zugang-konto" className="rounded-2xl border border-white/10 bg-card/95 p-5 md:p-6">
          <div className="mb-4 border-b border-white/10 pb-4">
            <div className="mb-2 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Zugang & Konto
            </div>
            <h2 className="text-lg font-semibold text-white">Anmeldung und Sitzungen</h2>
            <p className="mt-1 text-sm text-gray-400">
              E-Mail, Passwort und aktive Sitzungen änderst du hier.
            </p>
          </div>
          <div className="space-y-6">
            <SettingsAccountSection email={user.email} />
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
              <SettingsSessionsSection />
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}
