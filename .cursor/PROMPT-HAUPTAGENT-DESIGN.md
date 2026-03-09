# Design-Aufgabe: Markierte Texte in der Cuckymode-Einstellungen entfernen

## Ziel

In der **Einstellungen** (Cuckymode / Zugriffsbeschränkung) die **markierten Texte** entfernen, wie vom Nutzer gewünscht.

## Datei

`components/settings/SettingsRestrictionSection.tsx`

## Zu entfernende / anzupassende Texte

### 1. Überschrift (H3)

- **Aktuell:** „Cuckymode – Schreiben nur mit Passwort“
- **Änderung:** Den Zusatz **„ – Schreiben nur mit Passwort“** entfernen.
- **Ergebnis:** Nur **„Cuckymode“** als Überschrift anzeigen.

### 2. Status-Anzeige (wenn Cuckymode aktiv)

- **Aktuell:** „Aktuell: Cuckymode ist **aktiv** – Schreiben nur mit Passwort.“
- **Änderung:** Den Zusatz **„ – Schreiben nur mit Passwort.“** entfernen.
- **Ergebnis:** „Aktuell: Cuckymode ist **aktiv**.“ (ohne den Passwort-Hinweis am Ende)

## Akzeptanzkriterien

- [ ] Die Überschrift lautet nur noch **„Cuckymode“** (ohne „ – Schreiben nur mit Passwort“).
- [ ] Die Statuszeile bei aktivem Cuckymode lautet nur noch **„Aktuell: Cuckymode ist aktiv.“** (ohne „ – Schreiben nur mit Passwort.“).

Nach Umsetzung: Inhalt dieser Datei (PROMPT-HAUPTAGENT-DESIGN.md) vollständig leeren.
