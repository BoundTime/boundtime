import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  let body: { restrictionEnabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Body" }, { status: 400 });
  }
  if (typeof body.restrictionEnabled !== "boolean") {
    return NextResponse.json({ error: "restrictionEnabled fehlt oder ist kein Boolean" }, { status: 400 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();
  if (profile?.account_type !== "couple") {
    return NextResponse.json({ error: "Nur für Paar-Accounts" }, { status: 403 });
  }
  const { error } = await supabase
    .from("profiles")
    .update({ restriction_enabled: body.restrictionEnabled })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { accountType: null, restrictionEnabled: false, isBlockingWrite: false, hasPasswordSet: false, restrictionFlags: null },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, restriction_enabled, restriction_password_hash, restriction_no_single_female_profiles, restriction_no_messages, restriction_no_couple_profiles, restriction_no_images")
    .eq("id", user.id)
    .single();
  const accountType = profile?.account_type ?? null;
  const restrictionEnabled = profile?.restriction_enabled ?? false;
  const hasPasswordSet = Boolean(profile?.restriction_password_hash && profile.restriction_password_hash.trim() !== "");
  const isBlockingWrite = accountType === "couple" && restrictionEnabled;
  const restrictionFlags = profile
    ? {
        noSingleFemaleProfiles: profile.restriction_no_single_female_profiles ?? false,
        noMessages: profile.restriction_no_messages ?? false,
        noCoupleProfiles: profile.restriction_no_couple_profiles ?? false,
        noImages: profile.restriction_no_images ?? false,
      }
    : null;
  return NextResponse.json(
    {
      accountType,
      restrictionEnabled,
      isBlockingWrite,
      hasPasswordSet,
      restrictionFlags,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    }
  );
}
