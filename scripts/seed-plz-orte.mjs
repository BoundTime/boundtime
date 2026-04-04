/**
 * Liest eine CSV und fügt Zeilen in die Supabase-Tabelle plz_orte ein (Spalte country: DE / AT / CH).
 * Voraussetzung: .env.local mit NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * CSV optional mit Spalte Land / Country (Werte DE, AT, CH). Ohne Spalte wird DE angenommen.
 *
 * PLZ: Deutschland 5-stellig, Österreich/Schweiz 4-stellig.
 *
 * Aufruf:
 *   node scripts/seed-plz-orte.mjs
 *   node scripts/seed-plz-orte.mjs data/meine_plz.csv
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname, isAbsolute } from "path";
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

const envPath = join(root, ".env.local");
const loaded = loadEnv(envPath) || loadEnv(join(process.cwd(), ".env.local"));
if (!loaded) {
  console.error("Fehler: Datei .env.local nicht gefunden.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Fehler: NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen.");
  process.exit(1);
}

const csvArg = process.argv[2];
const csvPath = csvArg
  ? isAbsolute(csvArg)
    ? csvArg
    : join(root, csvArg)
  : join(root, "data", "plz_orte.csv");

if (!existsSync(csvPath)) {
  console.error("Fehler: CSV nicht gefunden:", csvPath);
  process.exit(1);
}

const supabase = createClient(url, key);
const raw = readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/).filter((l) => l.trim());
const sep = lines[0].includes(";") ? ";" : ",";

function parseLine(line) {
  return line.split(sep).map((p) => p.replace(/^["']|["']$/g, "").trim());
}

const header = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s/g, ""));
const hasHeader =
  header.some((h) => h === "plz" || h === "postleitzahl") ||
  header.some((h) => h === "ort") ||
  header.some((h) => h === "bundesland");

const idxPlz = header.findIndex((h) => h === "plz" || h === "postleitzahl");
const idxOrt = header.findIndex((h) => h === "ort");
const idxBundesland = header.findIndex((h) => h === "bundesland");
const idxCountry = header.findIndex(
  (h) => h === "country" || h === "land" || h === "staat" || h === "iso" || h === "nation"
);

function parseCountryCell(raw) {
  const u = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (u === "AT" || u === "AUT" || u === "A") return "AT";
  if (u === "CH" || u === "CHE" || u === "SUI") return "CH";
  if (u === "DE" || u === "DEU" || u === "D") return "DE";
  if (u.includes("ÖSTER") || u === "AUSTRIA") return "AT";
  if (u.includes("SCHWEIZ") || u === "SWITZERLAND") return "CH";
  if (u.includes("DEUTSCH") || u === "GERMANY") return "DE";
  return "DE";
}

function normalizePlzAndCountry(digits, country) {
  if (country === "DE") {
    const plz = digits.padStart(5, "0").slice(0, 5);
    if (plz.length !== 5 || !/^\d{5}$/.test(plz)) return null;
    return { plz, country: "DE" };
  }
  const d = digits.slice(0, 4);
  if (d.length < 4 || !/^\d{4}$/.test(d)) return null;
  return { plz: d, country };
}

const start = hasHeader ? 1 : 0;
const rows = [];

for (let i = start; i < lines.length; i++) {
  const parts = parseLine(lines[i]);
  let plzRaw,
    ort,
    bundesland,
    country = "DE";

  if (hasHeader && idxPlz >= 0 && idxOrt >= 0) {
    plzRaw = String(parts[idxPlz] ?? "").replace(/\D/g, "");
    ort = String(parts[idxOrt] ?? "").trim();
    bundesland = idxBundesland >= 0 && parts[idxBundesland] ? String(parts[idxBundesland]).trim() : null;
    if (idxCountry >= 0 && parts[idxCountry]) country = parseCountryCell(parts[idxCountry]);
  } else {
    plzRaw = String(parts[0] ?? "").replace(/\D/g, "");
    ort = String(parts[1] ?? "").trim();
    bundesland = parts[2] ? String(parts[2]).trim() : null;
    if (parts[3]) country = parseCountryCell(parts[3]);
  }

  const normalized = normalizePlzAndCountry(plzRaw, country === "AT" || country === "CH" ? country : "DE");
  if (!normalized || !ort) continue;
  rows.push({ plz: normalized.plz, ort, bundesland, country: normalized.country });
}

console.log(`${rows.length} gültige Zeilen gefunden (${csvPath}). Füge in plz_orte ein …`);

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
