import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Startet den Ablauf zum Zurücksetzen des Cuckymode-Passworts:
 * Sendet eine E-Mail an die Account-E-Mail mit Hinweis zum Reset.
 * Optional: RESEND_API_KEY setzen. Ohne Konfiguration wird trotzdem ok zurückgegeben,
 * damit der Button funktioniert (E-Mail-Versand kann später ergänzt werden).
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

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@boundtime.app";
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [user.email],
          subject: "Cuckymode-Passwort zurücksetzen – BoundTime",
          text: `Hallo,\n\ndu hast angefordert, das Cuckymode-Passwort zurückzusetzen. Der Ablauf zum Zurücksetzen kann in einer zukünftigen Version per Link erfolgen. Bis dahin: In den Einstellungen unter Cuckymode kann die Hotwife das Passwort über „Passwort ändern“ mit dem aktuellen Passwort ändern. Falls das aktuelle Passwort nicht mehr bekannt ist, wende dich an den Support.\n\n– BoundTime`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Resend forgot-password:", res.status, err);
        return NextResponse.json({ error: "E-Mail konnte nicht versendet werden" }, { status: 500 });
      }
    } catch (e) {
      console.error("Resend forgot-password:", e);
      return NextResponse.json({ error: "E-Mail konnte nicht versendet werden" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
