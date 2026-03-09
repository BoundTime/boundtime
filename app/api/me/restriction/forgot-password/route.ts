import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/send-email";

export const dynamic = "force-dynamic";

/**
 * Sendet eine E-Mail an die Account-E-Mail mit Hinweis zum Cuckymode-Passwort zurücksetzen.
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
    .select("account_type, restriction_password_hash")
    .eq("id", user.id)
    .single();
  if (profile?.account_type !== "couple") {
    return NextResponse.json({ error: "Nur für Paar-Accounts" }, { status: 403 });
  }
  const hasPassword = Boolean(profile?.restriction_password_hash?.trim());
  if (!hasPassword) {
    return NextResponse.json({ error: "Es ist kein Cuckymode-Passwort gesetzt" }, { status: 400 });
  }

  const result = await sendEmail({
    to: user.email,
    subject: "Cuckymode-Passwort zurücksetzen – BoundTime",
    text: `Hallo,\n\ndu hast angefordert, das Cuckymode-Passwort zurückzusetzen. Der Ablauf zum Zurücksetzen kann in einer zukünftigen Version per Link erfolgen. Bis dahin: In den Einstellungen unter Cuckymode kann die Hotwife das Passwort über „Passwort ändern“ mit dem aktuellen Passwort ändern. Falls das aktuelle Passwort nicht mehr bekannt ist, wende dich an den Support.\n\n– BoundTime`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "E-Mail konnte nicht versendet werden" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
