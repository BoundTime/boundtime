/**
 * Geocoding: PLZ/Ort → Koordinaten (Nominatim, Deutschland).
 * Für Suchradius und Speicherung in profiles.latitude/longitude.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "BoundTime/1.0 (Profil-Suche; mail@example.com)";

export type GeocodeResult = { lat: number; lon: number };

export async function geocodeDe(
  postalCode?: string | null,
  city?: string | null
): Promise<GeocodeResult | null> {
  const plz = postalCode?.replace(/\D/g, "").slice(0, 5) || "";
  const ort = city?.trim() || "";
  if (!plz && !ort) return null;

  const q = [plz, ort].filter(Boolean).join(" ");
  const params = new URLSearchParams({
    q: q + ", Deutschland",
    format: "json",
    limit: "1",
    countrycodes: "de",
  });
  const url = `${NOMINATIM_URL}?${params.toString()}`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

/** Haversine: Entfernung in km zwischen zwei Koordinaten */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
