import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/resend-verification
 *
 * Sendet die Bestätigungs-E-Mail für noch nicht verifizierte Accounts erneut.
 * Sicherheit:
 * - Nimmt eine E-Mail-Adresse entgegen, antwortet aber immer neutral (kein Account-Leak).
 * - Supabase bringt eigenes Rate-Limiting mit; zusätzlich könnte später IP/E-Mail gedrosselt werden.
 */
export async function POST(request: Request) {
  let email: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    const raw = typeof body.email === "string" ? body.email : null;
    email = raw?.trim() || null;
  } catch {
    email = null;
  }

  if (!email) {
    // Neutrale Antwort – keine Info, ob Konto existiert.
    return NextResponse.json({
      ok: true,
      message:
        "Wenn ein Konto mit dieser E-Mail existiert und noch nicht bestätigt ist, haben wir dir die E-Mail erneut geschickt.",
    });
  }

  const supabase = await createClient();

  try {
    // Supabase Auth v2: Verifizierungs-E-Mail für Signup erneut senden.
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      console.error("resend verification error", error);
    }
  } catch (e) {
    console.error("resend verification exception", e);
  }

  return NextResponse.json({
    ok: true,
    message:
      "Wenn ein Konto mit dieser E-Mail existiert und noch nicht bestätigt ist, haben wir dir die E-Mail erneut geschickt.",
  });
}

