import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ accountType: null, restrictionEnabled: false, isBlockingWrite: false }, { status: 200 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, restriction_enabled")
    .eq("id", user.id)
    .single();
  const accountType = profile?.account_type ?? null;
  const restrictionEnabled = profile?.restriction_enabled ?? false;
  const isBlockingWrite = accountType === "couple" && restrictionEnabled;
  return NextResponse.json({
    accountType,
    restrictionEnabled,
    isBlockingWrite,
  });
}
