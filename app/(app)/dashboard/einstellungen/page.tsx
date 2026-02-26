import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ChastityCatalogManager } from "@/components/chastity/ChastityCatalogManager";
import { SettingsAccountSection } from "@/components/settings/SettingsAccountSection";
import { SettingsSessionsSection } from "@/components/settings/SettingsSessionsSection";
import { SettingsBlockedUsersSection } from "@/components/settings/SettingsBlockedUsersSection";
import { CollapsibleSection } from "@/components/settings/CollapsibleSection";

export default async function EinstellungenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isDomOrSwitcher =
    profile?.role === "Dom" || profile?.role === "Switcher";

  return (
    <Container className="py-16">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
          ← Zurück zum Start
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-white">Einstellungen</h1>
      <p className="mt-1 text-sm text-gray-400">
        Verwalte deine Kontoeinstellungen und den Belohnungskatalog.
      </p>

      <div className="mt-8 space-y-4">
        {isDomOrSwitcher ? (
          <CollapsibleSection title="Belohnungskatalog" defaultOpen>
            <ChastityCatalogManager domId={user.id} embedded />
          </CollapsibleSection>
        ) : (
          <CollapsibleSection title="Belohnungskatalog">
            <p className="text-gray-400">
              Der Belohnungskatalog ist für Dom(me)s – du siehst hier deine Konto- und Sitzungseinstellungen.
            </p>
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Konto" defaultOpen>
          <SettingsAccountSection email={user.email} />
        </CollapsibleSection>

        <CollapsibleSection title="Sitzungen">
          <SettingsSessionsSection />
        </CollapsibleSection>

        <CollapsibleSection title="Blockierte User">
          <SettingsBlockedUsersSection />
        </CollapsibleSection>
      </div>
    </Container>
  );
}
