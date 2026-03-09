import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Sendet eine Bestätigungs-E-Mail an die Account-E-Mail des Nutzers,
 * wenn Cuckymode zum ersten Mal eingerichtet wurde.
 * Optional: RESEND_API_KEY setzen, um E-Mails über Resend zu versenden.
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
          subject: "Cuckymode eingerichtet – BoundTime",
          text: `Hallo,\n\nCuckymode wurde erfolgreich für dein BoundTime-Paarprofil eingerichtet. Das Passwort ist gesetzt und aktiv.\n\nBei Fragen: Einstellungen → Cuckymode.\n\n– BoundTime`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Resend send-setup-confirmation:", res.status, err);
        return NextResponse.json({ error: "E-Mail konnte nicht versendet werden" }, { status: 500 });
      }
    } catch (e) {
      console.error("Resend send-setup-confirmation:", e);
      return NextResponse.json({ error: "E-Mail konnte nicht versendet werden" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
