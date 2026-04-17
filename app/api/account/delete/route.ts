import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[account/delete] SUPABASE_SERVICE_ROLE_KEY fehlt. Siehe .env.example – Key aus Supabase Dashboard → Settings → API."
      );
    }
    return NextResponse.json(
      {
        error: "Account-Löschung ist nicht konfiguriert.",
        ...(process.env.NODE_ENV === "development"
          ? {
              hint: "Trage SUPABASE_SERVICE_ROLE_KEY in .env.local ein (Supabase → Settings → API → service_role). Deployment: dieselbe Variable setzen.",
            }
          : {}),
      },
      { status: 500 }
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
