import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  let body: {
    currentPassword?: string;
    noSingleFemaleProfiles?: boolean;
    noMessages?: boolean;
    noCoupleProfiles?: boolean;
    noImages?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
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
  const needsPassword = profile?.restriction_enabled === true && hasPassword;
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword.trim() : null;
  if (needsPassword && !currentPassword) {
    return NextResponse.json({ error: "Aktuelles Passwort erforderlich" }, { status: 400 });
  }
  const { error } = await supabase.rpc("set_restriction_flags", {
    p_no_single_female_profiles: typeof body.noSingleFemaleProfiles === "boolean" ? body.noSingleFemaleProfiles : null,
    p_no_messages: typeof body.noMessages === "boolean" ? body.noMessages : null,
    p_no_couple_profiles: typeof body.noCoupleProfiles === "boolean" ? body.noCoupleProfiles : null,
    p_no_images: typeof body.noImages === "boolean" ? body.noImages : null,
    p_current_password: needsPassword ? currentPassword : null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
