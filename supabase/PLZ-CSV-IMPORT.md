# PLZ/Orte-CSV einspielen

Die Tabelle `plz_orte` ist bereits mit Beispieldaten gefüllt. Für eine **vollständige** deutsche PLZ-Liste kannst du eine CSV einspielen.

---

## Wichtig: CSV mit vielen Spalten (PLZ, Bundesland, Kreis, Ort, …)

Viele offizielle CSVs haben **mehr Spalten** als unsere Tabelle (z. B. **PLZ, Bundesland, Kreis, Ort, Kreisschlüssel, Typ**). Der **direkte Import im Supabase Table Editor** schlägt dann mit „DATA INCOMPATIBLE“ / „columns not present in your table“ fehl, weil die Spaltennamen und -anzahl nicht übereinstimmen.

**Lösung:** Die CSV **nicht** im Dashboard importieren, sondern mit dem **Seed-Skript** einspielen (Option 2). Das Skript liest deine CSV (mit allen Spalten), erkennt die Kopfzeile und schreibt nur **plz**, **ort** und **bundesland** in die Tabelle.

---

## CSV im Projektordner + Seed-Skript (empfohlen für deine CSV)

1. **CSV-Datei** in den Ordner **`data`** im Projekt legen:
   ```
   c:\BoundTime\data\plz_orte.csv
   ```
2. Deine CSV kann **genau so bleiben**, wie sie ist (z. B. mit **PLZ, Bundesland, Kreis, Ort, Kreisschlüssel, Typ**). Das Skript erkennt die Kopfzeile und übernimmt nur **PLZ → plz**, **Ort → ort**, **Bundesland → bundesland**. Die anderen Spalten werden ignoriert.
3. Im Projektordner im Terminal ausführen:
   ```bash
   node scripts/seed-plz-orte.mjs
   ```
   (`.env.local` wird automatisch geladen.)

Das Skript liest `data/plz_orte.csv`, erkennt die Spalten per Kopfzeile, bereinigt die Zeilen (nur 5-stellige PLZ) und fügt sie in `plz_orte` ein. **Einmal ausführen** – bei erneutem Lauf entstehen ggf. doppelte Einträge.

**Falls Fehler „new row violates row-level security policy“:** In Supabase im **SQL Editor** die Migration **`supabase/migrations/005_plz_orte_allow_insert.sql`** ausführen (Inhalt einfügen → Run). Damit darf das Skript Zeilen in `plz_orte` einfügen. Anschließend das Skript erneut starten.

---

## Wo die CSV hingehört

| Variante | Wo die CSV liegen muss |
|----------|-------------------------|
| **Seed-Skript** (für CSVs mit PLZ, Bundesland, Kreis, Ort, …) | Im Projekt: **`c:\BoundTime\data\plz_orte.csv`** – dann `node scripts/seed-plz-orte.mjs` ausführen. |
