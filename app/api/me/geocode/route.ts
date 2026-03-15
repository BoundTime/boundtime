import { createClient } from "@/lib/supabase/server";
import { geocodeDe } from "@/lib/geocode";
import { NextResponse } from "next/server";

/**
 * GET: Geocodiert die PLZ/Ort des aktuellen Profils und speichert latitude/longitude.
 * Nach Profil-Speicherung aufrufen, damit Suchradius-Filter funktioniert.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("postal_code, city")
    .eq("id", user.id)
    .single();

  if (!profile?.postal_code && !profile?.city) {
    return NextResponse.json({ ok: true, message: "Kein Ort/PLZ gesetzt" });
  }

  const coords = await geocodeDe(profile.postal_code ?? null, profile.city ?? null);
  if (!coords) {
    return NextResponse.json({ ok: false, message: "Geocoding fehlgeschlagen" });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ latitude: coords.lat, longitude: coords.lon })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
