# Git & Vercel – Schritt-für-Schritt für Einsteiger

Diese Anleitung hilft dir, Änderungen korrekt zu speichern und online zu bringen.

---

## Teil 1: Prüfen, ob Änderungen da sind

### In Cursor / VS Code
1. Öffne die **Quellcode-Verwaltung** (linke Seitenleiste, Symbol mit Verzweigung)
2. Unter **"Änderungen"** siehst du alle geänderten Dateien
3. Wenn dort Dateien stehen → du hast lokale Änderungen, die noch nicht hochgeladen sind

---

## Teil 2: Mit Git Gui committen und pushen

### Schritt 1: Git Gui öffnen
- **Windows:** Startmenü → "Git Gui" suchen und öffnen
- Oder: Rechtsklick im Ordner `C:\BoundTime` → "Git Gui hier öffnen"

### Schritt 2: Rescan
- Klicke auf **"Rescan"** (damit Git alle Änderungen erkennt)

### Schritt 3: Änderungen stagen
- Unter **"Unstaged Changes"** siehst du geänderte Dateien
- Klicke eine Datei an → **"Stage Changed"** (oder Doppelklick)
- Wiederhole das für alle Dateien, bis sie unter **"Staged Changes"** stehen
- Oder: Rechtsklick → **"Stage All"** (alle auf einmal)

### Schritt 4: Commit
- In das **Commit-Nachricht-Feld** (oberhalb der Buttons) z.B. eintragen:
  ```
  E-Mail-Bestätigungsseite, Weiterleitung auch bei SMTP-Fehler
  ```
- Auf **"Commit"** klicken

### Schritt 5: Push
- Auf **"Push"** klicken
- Falls nach Benutzername/Passwort gefragt: GitHub-Zugangsdaten eingeben
- Warten, bis "Push complete" erscheint

---

## Teil 3: Prüfen, ob Vercel aktuell ist

### Schritt 1: Vercel öffnen
- https://vercel.com/dashboard
- Projekt **boundtime** auswählen

### Schritt 2: Deployments prüfen
- Links auf **"Deployments"** klicken
- Der oberste Eintrag ist der neueste
- **Status** sollte **"Ready"** sein (grüner Haken)
- **Zeit** sollte vor wenigen Minuten liegen (nach dem Push)
- **Commit-Nachricht** sollte zu deinem letzten Commit passen

### Schritt 3: Build-Fehler?
- Wenn Status **"Error"** (rot): darauf klicken
- Unter **"Building"** oder **"Logs"** die Fehlermeldung lesen

---

## Teil 4: Cache umgehen beim Testen

Manchmal zeigt der Browser eine alte Version der Seite.

1. **Hard-Refresh:** `Strg + Shift + R` (oder `Strg + F5`)
2. Oder: **Inkognito-Fenster** öffnen (`Strg + Shift + N`)
3. https://www.boundtime.de/register aufrufen und testen

---

## Checkliste vor dem Test

- [ ] Git Gui: Rescan gemacht
- [ ] Alle Änderungen gestagt
- [ ] Commit mit Nachricht erstellt
- [ ] Push erfolgreich
- [ ] Vercel: neuer Deployment mit "Ready"
- [ ] Browser: Inkognito oder Hard-Refresh

---

## Wenn es nicht funktioniert

1. **Screenshot** von Git Gui (nach Rescan) – welche Dateien sind gestagt?
2. **Screenshot** von Vercel Deployments – welcher Status beim letzten?
3. **Frage:** Testest du unter www.boundtime.de oder lokal (localhost)?
