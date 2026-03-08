import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Setzt das Restriction-Passwort (Hash), wenn die Beschränkung aktiv ist aber noch kein Hash existiert (Reparaturfall).
 * Wird von den Einstellungen aufgerufen, damit das Passwort auch ohne Migration 072 gespeichert werden kann.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, restriction_enabled, restriction_password_hash")
    .eq("id", user.id)
    .single();

  if (profile?.account_type !== "couple") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const hasHash = Boolean(
    profile?.restriction_password_hash != null &&
      (profile.restriction_password_hash ?? "").trim() !== ""
  );
  if (!profile?.restriction_enabled || hasHash) {
    return NextResponse.json({ ok: true }); // Nichts zu reparieren
  }

  const { error } = await supabase.rpc("set_restriction_password_hash_only", {
    p_password: password,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
