import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("restriction_enabled, restriction_password_hash")
    .eq("id", user.id)
    .single();

  if (profile?.restriction_enabled && (profile?.restriction_password_hash == null || (profile.restriction_password_hash ?? "").trim() === "")) {
    return NextResponse.json({ ok: false, noPasswordSet: true });
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { data } = await supabase.rpc("check_restriction_password", {
    p_user_id: user.id,
    p_password: password,
  });
  return NextResponse.json({ ok: data === true });
}
