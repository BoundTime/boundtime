import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/send-email";

export const dynamic = "force-dynamic";

/**
 * Sendet eine Bestätigungs-E-Mail an die Account-E-Mail des Nutzers,
 * wenn Cuckymode zum ersten Mal eingerichtet wurde.
 * Nutzt RESEND_API_KEY (Resend) oder SMTP (z. B. IONOS: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM).
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet oder keine E-Mail" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, restriction_enabled, restriction_password_hash")
    .eq("id", user.id)
    .single();
  if (profile?.account_type !== "couple") {
    return NextResponse.json({ error: "Nur für Paar-Accounts" }, { status: 403 });
  }
  const hasPassword = Boolean(profile?.restriction_password_hash?.trim());
  if (!hasPassword) {
    return NextResponse.json({ error: "Kein Cuckymode-Passwort gesetzt" }, { status: 400 });
  }

  const result = await sendEmail({
    to: user.email,
    subject: "Cuckymode eingerichtet – BoundTime",
    text: `Hallo,\n\nCuckymode wurde erfolgreich für dein BoundTime-Paar eingerichtet. Das Passwort ist gesetzt und aktiv.\n\nBei Fragen: Einstellungen → Cuckymode.\n\n– BoundTime`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "E-Mail konnte nicht versendet werden" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
