import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type DeleteBody = { password?: string };

async function removePaths(
  admin: any,
  bucket: string,
  paths: Array<string | null | undefined>
) {
  const clean = Array.from(
    new Set(
      paths
        .map((p) => (typeof p === "string" ? p.trim() : ""))
        .filter((p) => p.length > 0)
    )
  );
  if (clean.length === 0) return;
  const { error } = await admin.storage.from(bucket).remove(clean);
  if (error) throw new Error(`Storage-Löschung (${bucket}) fehlgeschlagen: ${error.message}`);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const email = user.email ?? "";
  if (!email) {
    return NextResponse.json({ error: "Für diesen Account ist keine Passwortprüfung möglich." }, { status: 400 });
  }

  let body: DeleteBody = {};
  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const password = (body.password ?? "").trim();
  if (password.length < 6) {
    return NextResponse.json({ error: "Bitte aktuelles Passwort eingeben." }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  /** Ohne Service Role kann auth.admin.deleteUser nicht aufgerufen werden – nur serverseitig setzen, nie im Client. */
  const hintServiceRole =
    "Setze SUPABASE_SERVICE_ROLE_KEY in den Server-Umgebungsvariablen (Supabase → Project Settings → API → service_role, geheim halten). Lokal: .env.local. Produktion: z. B. Vercel → Settings → Environment Variables.";
  const hintUrlKeys =
    "NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY müssen für den Server erreichbar gesetzt sein.";

  if (!serviceRoleKey) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[account/delete] SUPABASE_SERVICE_ROLE_KEY fehlt. Siehe .env.example – Key aus Supabase Dashboard → Settings → API."
      );
    }
    return NextResponse.json(
      { error: "Account-Löschung ist nicht konfiguriert.", hint: hintServiceRole },
      { status: 500 }
    );
  }
  if (!anonKey || !supabaseUrl) {
    return NextResponse.json(
      {
        error: "Account-Löschung ist nicht vollständig konfiguriert (Supabase URL/Anon Key fehlt).",
        hint: hintUrlKeys,
      },
      { status: 500 }
    );
  }

  const admin = createAdminClient(
    supabaseUrl,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Passwort prüfen (erst danach Löschvorgang erlauben)
  const authCheck = createAdminClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await authCheck.auth.signInWithPassword({ email, password });
  if (signInError) {
    return NextResponse.json({ error: "Passwort ist falsch oder ungültig." }, { status: 400 });
  }

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const { data: verifications } = await admin
      .from("verifications")
      .select("photo_path")
      .eq("user_id", user.id);

    const { data: posts } = await admin
      .from("posts")
      .select("image_url")
      .eq("author_id", user.id);

    const { data: albums } = await admin
      .from("photo_albums")
      .select("id")
      .eq("owner_id", user.id);
    const albumIds = (albums ?? []).map((a) => a.id);
    let albumPhotos: Array<{ storage_path: string | null }> = [];
    if (albumIds.length > 0) {
      const { data } = await admin
        .from("photo_album_photos")
        .select("storage_path")
        .in("album_id", albumIds);
      albumPhotos = data ?? [];
    }

    const { data: myMessages } = await admin
      .from("messages")
      .select("id")
      .eq("sender_id", user.id);
    const messageIds = (myMessages ?? []).map((m) => m.id);
    let messageAttachments: Array<{ file_path: string | null }> = [];
    if (messageIds.length > 0) {
      const { data } = await admin
        .from("message_attachments")
        .select("file_path")
        .in("message_id", messageIds);
      messageAttachments = data ?? [];
    }

    const { data: arrangements } = await admin
      .from("chastity_arrangements")
      .select("id")
      .or(`dom_id.eq.${user.id},sub_id.eq.${user.id}`);
    const arrangementIds = (arrangements ?? []).map((a) => a.id);
    let taskProofs: Array<{ proof_photo_url: string | null }> = [];
    if (arrangementIds.length > 0) {
      const { data } = await admin
        .from("chastity_tasks")
        .select("proof_photo_url")
        .in("arrangement_id", arrangementIds);
      taskProofs = data ?? [];
    }

    await removePaths(admin, "avatars", [profile?.avatar_url]);
    await removePaths(admin, "verifications", (verifications ?? []).map((v) => v.photo_path));
    await removePaths(admin, "post-images", (posts ?? []).map((p) => p.image_url));
    await removePaths(admin, "album-photos", albumPhotos.map((p) => p.storage_path));
    await removePaths(
      admin,
      "message-attachments",
      messageAttachments.map((m) => m.file_path)
    );
    await removePaths(admin, "task-proofs", taskProofs.map((t) => t.proof_photo_url));
  } catch (cleanupError) {
    const msg = cleanupError instanceof Error ? cleanupError.message : "Unbekannter Fehler bei Datenbereinigung.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
