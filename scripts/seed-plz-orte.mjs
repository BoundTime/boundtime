/**
 * Liest data/plz_orte.csv und fügt die Zeilen in die Supabase-Tabelle plz_orte ein.
 * Voraussetzung: .env.local mit NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Unterstützte CSV-Formate:
 * - Mit Kopfzeile "PLZ";"Bundesland";"Kreis";"Ort";"Kreisschlüssel";"Typ" (wie GovData/suche-postleitzahl)
 * - Oder einfach: plz;ort;bundesland (beliebige Reihenfolge per Kopfzeile)
 *
 * Ausführung: node scripts/seed-plz-orte.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv(filePath) {
  if (!existsSync(filePath)) return false;
  let env = readFileSync(filePath, "utf8");
  if (env.charCodeAt(0) === 0xfeff) env = env.slice(1);
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "").replace(/\r$/, "");
    process.env[key] = value;
  }
  return true;
}

// .env.local laden (zuerst Projektordner, dann aktuelles Verzeichnis)
const envPath = join(root, ".env.local");
const loaded = loadEnv(envPath) || loadEnv(join(process.cwd(), ".env.local"));
if (!loaded) {
  console.error("Fehler: Datei .env.local nicht gefunden.");
  console.error("Lege im Projektordner (c:\\BoundTime) eine Datei .env.local an mit:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Fehler: NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen.");
  console.error("Prüfe die Datei .env.local im Projektordner (c:\\BoundTime).");
  console.error("Sie muss genau diese Zeilen enthalten (mit deinen echten Werten):");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...");
  process.exit(1);
}

const csvPath = join(root, "data", "plz_orte.csv");
if (!existsSync(csvPath)) {
  console.error("Fehler: Datei data/plz_orte.csv nicht gefunden. Bitte CSV dort ablegen.");
  process.exit(1);
}

const supabase = createClient(url, key);
const raw = readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/).filter((l) => l.trim());
const sep = lines[0].includes(";") ? ";" : ",";

function parseLine(line) {
  const parts = line.split(sep).map((p) => p.replace(/^["']|["']$/g, "").trim());
  return parts;
}

const header = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s/g, ""));
const hasHeader =
  header.some((h) => h === "plz" || h === "postleitzahl") ||
  header.some((h) => h === "ort") ||
  header.some((h) => h === "bundesland");

// Spalten-Indizes ermitteln (für Format: PLZ, Bundesland, Kreis, Ort, Kreisschlüssel, Typ)
const idxPlz = header.findIndex((h) => h === "plz" || h === "postleitzahl");
const idxOrt = header.findIndex((h) => h === "ort");
const idxBundesland = header.findIndex((h) => h === "bundesland");

const start = hasHeader ? 1 : 0;
const rows = [];

for (let i = start; i < lines.length; i++) {
  const parts = parseLine(lines[i]);
  let plz, ort, bundesland;

  if (hasHeader && idxPlz >= 0 && idxOrt >= 0) {
    plz = String(parts[idxPlz] ?? "").replace(/\D/g, "").padStart(5, "0").slice(0, 5);
    ort = String(parts[idxOrt] ?? "").trim();
    bundesland = idxBundesland >= 0 && parts[idxBundesland] ? String(parts[idxBundesland]).trim() : null;
  } else {
    plz = String(parts[0] ?? "").replace(/\D/g, "").padStart(5, "0").slice(0, 5);
    ort = String(parts[1] ?? "").trim();
    bundesland = parts[2] ? String(parts[2]).trim() : null;
  }

  if (plz.length === 5 && ort) {
    rows.push({ plz, ort, bundesland });
  }
}

console.log(`${rows.length} gültige Zeilen gefunden. Füge in plz_orte ein …`);

const BATCH = 500;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  const { error } = await supabase.from("plz_orte").insert(chunk);
  if (error) {
    console.error("Fehler beim Einfügen:", error.message);
    process.exit(1);
  }
  inserted += chunk.length;
  console.log(`${inserted}/${rows.length} …`);
}

console.log("Fertig. plz_orte wurde befüllt.");
