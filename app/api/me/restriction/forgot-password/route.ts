import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/send-email";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/**
 * Erzeugt Reset-Token, speichert ihn, sendet E-Mail mit Link.
 * Der Link führt zu /api/restriction/reset?token=xxx – dort wird Cuckymode vollständig zurückgesetzt.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet oder keine E-Mail" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, restriction_password_hash, nick")
    .eq("id", user.id)
    .single();
  if (profile?.account_type !== "couple") {
    return NextResponse.json({ error: "Nur für Paar-Accounts" }, { status: 403 });
  }
  const hasPassword = Boolean(profile?.restriction_password_hash?.trim());
  if (!hasPassword) {
    return NextResponse.json({ error: "Es ist kein Cuckymode-Passwort gesetzt" }, { status: 400 });
  }

  let origin: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    origin = typeof body.origin === "string" ? body.origin : null;
  } catch {
    // ignore
  }
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!baseUrl) {
    return NextResponse.json({ error: "Basis-URL konnte nicht ermittelt werden" }, { status: 500 });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde

  const { error: insertError } = await supabase.from("restriction_password_reset_tokens").insert({
    user_id: user.id,
    token,
    expires_at: expiresAt.toISOString(),
  });
  if (insertError) {
    console.error("restriction reset token insert:", insertError);
    return NextResponse.json({ error: "Token konnte nicht erstellt werden" }, { status: 500 });
  }

  const resetUrl = `${baseUrl.replace(/\/$/, "")}/api/restriction/reset?token=${token}`;
  const greeting = profile?.nick?.trim() ? `Hallo ${profile.nick.trim()},` : "Hallo,";
  const result = await sendEmail({
    to: user.email,
    subject: "Cuckymode-Passwort zurücksetzen – BoundTime",
    text: `${greeting}\n\ndu hast angefordert, das Cuckymode-Passwort zurückzusetzen.\n\nKlicke auf den folgenden Link, um das Passwort zu löschen. Danach kannst du in den Einstellungen unter Cuckymode ein neues Passwort festlegen – als wäre es noch nie gesetzt worden.\n\n${resetUrl}\n\nDer Link ist 1 Stunde gültig und kann nur einmal verwendet werden.\n\nFalls du die Anfrage nicht gestellt hast, ignoriere diese E-Mail.\n\n– BoundTime`,
  });

  if (!result.ok) {
    await supabase.from("restriction_password_reset_tokens").delete().eq("token", token);
    return NextResponse.json({ error: result.error ?? "E-Mail konnte nicht versendet werden" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, email: user.email });
}
