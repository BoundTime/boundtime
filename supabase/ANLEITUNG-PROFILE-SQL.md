# Supabase: Profile-Tabellen und -Storage einrichten

Damit Registrierung (Nick, Geschlecht, Rolle) und die optionale Profilbearbeitung funktionieren, musst du **beide** SQL-Dateien einmalig in Supabase ausführen.

## 1. Basis: Profile und Nicks (falls noch nicht geschehen)

1. **Supabase** → **SQL Editor** → **New query**.
2. Inhalt von **`supabase/migrations/001_profiles.sql`** einfügen und **Run** ausführen.

## 2. Erweiterung: Geschlecht, Rolle, optionale Felder, Avatar-Storage

1. Im **SQL Editor** wieder **New query**.
2. Inhalt von **`supabase/migrations/002_profile_details.sql`** einfügen und **Run** ausführen.
3. Damit werden die Spalten Geschlecht/Rolle und alle optionalen Profilfelder angelegt sowie der Storage-Bucket **avatars** für Profilbilder erstellt.

## 3. Ort (PLZ/Stadt), „Was suchst du?“ (Mehrfachauswahl), Erwartungen, Avatar-Policies

1. Im **SQL Editor** wieder **New query**.
2. Inhalt von **`supabase/migrations/003_profile_ort_suche_erwartungen.sql`** einfügen und **Run** ausführen.
3. Damit kommen die Felder **Stadt** und **PLZ**, die Mehrfachauswahl **Was suchst du?**, das Feld **Was erwartest du von deinem Gesuchten?** sowie angepasste Storage-Policies für den Profilbild-Upload.

## 4. PLZ/Orte-Datenbasis für Autocomplete

1. Im **SQL Editor** wieder **New query**.
2. Inhalt von **`supabase/migrations/004_plz_orte.sql`** einfügen und **Run** ausführen.
3. Inhalt von **`supabase/migrations/005_plz_orte_allow_insert.sql`** einfügen und **Run** ausführen (erlaubt dem Seed-Skript, CSV-Daten einzufügen).
4. Damit ist die Tabelle **plz_orte** angelegt. Ort/PLZ im Profil sind nur noch über Autocomplete wählbar. Für eine vollständige Liste: CSV in `data/plz_orte.csv` legen und `node scripts/seed-plz-orte.mjs` ausführen.

## Hinweis zu bestehenden Nutzern

Nutzer, die sich **vor** der ersten Migration registriert haben, haben ggf. noch keinen Eintrag in `profiles` oder keine Felder Geschlecht/Rolle. Sie können sich weiter einloggen; die App zeigt „Nutzer“, bis das Profil vervollständigt ist.
