import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/restriction/reset?token=xxx
 * Aufruf ohne Auth (Link aus E-Mail). Verbraucht Token und setzt Cuckymode vollständig zurück
 * (restriction_enabled=false, restriction_password_hash=null, restriction_recovery_email=null).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-reset-link", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("consume_restriction_reset_token", {
    p_token: token,
  });

  if (error) {
    return NextResponse.redirect(new URL("/login?error=invalid-reset-link", request.url));
  }

  return NextResponse.redirect(new URL("/login?cuckymode_reset=ok", request.url));
}
