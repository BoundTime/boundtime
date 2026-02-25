# BoundTime – Test-Checkliste

Diese Liste hilft dir, bei jeder Änderung den Überblick zu behalten. Nach jeder Umsetzung die Punkte durchgehen und abhaken.

---

## Aktuell: Privatnachrichten (1:1)

**Feature:** Nachrichten zwischen zwei Nutzern – Unterhaltungen, Chat-Ansicht, „Nachricht senden“ von Profil.

### Datenbank & Migration

- [x ] Migration ausgeführt (conversations, messages), keine Fehler
- [ x] RLS: Nur Beteiligte einer Unterhaltung sehen sie
- [x ] RLS: Nur Beteiligte können Nachrichten lesen/schreiben

### Nachrichten-Übersicht (`/dashboard/nachrichten`)

- [ x] Seite zeigt Liste aller Unterhaltungen des eingeloggten Users
- [ x] Pro Unterhaltung: Avatar + Nick des anderen Teilnehmers sichtbar
- [ x] Letzte Nachricht (Auszug) und Zeitstempel sichtbar
- [ x] Sortierung: neueste Unterhaltung zuerst
- [ x] Klick auf eine Unterhaltung öffnet den Chat
- [ x] Leerer Zustand: sinnvolle Meldung, wenn keine Unterhaltungen

### Chat-Ansicht (eine Unterhaltung)

- [ ]x Nachrichten chronologisch (älteste oben oder unten)
- [ ] Eigene Nachrichten erkennbar (rechts/andere Farbe)
- [ ] Fremde Nachrichten erkennbar (links)
- [ ] Sender (Nick) und Zeit angezeigt
- [ ] Eingabefeld unten, Submit sendet Nachricht
- [ ] Nachricht erscheint nach Senden in der Liste (ggf. Seite neu laden)
- [ ] Leere Nachricht kann nicht gesendet werden

### „Nachricht senden“ von Profil

- [ ] Button auf Profil-Detailseite (Entdecken → Profil) sichtbar
- [ ] Klick öffnet Chat mit dieser Person (Unterhaltung wird erstellt falls neu)
- [ ] Neue Unterhaltung erscheint in der Nachrichten-Übersicht

### Sicherheit & Randfälle

- [ ] Nicht eingeloggt: Redirect zu Login (bei geschützten Routen)
- [ ] Man kann nur Unterhaltungen sehen, an denen man beteiligt ist
- [ ] Keine Duplikate: Pro User-Paar nur eine Unterhaltung

---

## Frühere Features (bei Bedarf prüfen)

### Folgen + Feed + Posts

- [x ] Folgen/Entfolgen auf Profil funktioniert
- [x ] Feed zeigt Posts von gefolgten Personen
- [x ] Post erstellen funktioniert (Text, optional Bild)
- [x ] Eigene Posts im Feed sichtbar (wenn man sich folgt) oder getestet

### Keuschhaltung

- [ ] Vereinbarung starten (Dom), Sub annimmt
- [ ] Aufgaben erteilen, erledigen, Punkte
- [ ] Schloss-Anzeige (Dauer) auf Dashboard
- [ ] Belohnung abholen bei genug Punkten

### Entdecken + Profil

- [ ] Profil-Liste mit Filtern (Rolle, Geschlecht, Ort)
- [ ] Profil-Detailseite zeigt alle öffentlichen Felder
- [ ] Keuschhaltung anbieten/bitten von Profil aus

### Basis

- [x ] Registrierung (Nick, E-Mail, Passwort, Geschlecht, Rolle)
- [x ] Login / Logout
- [x ] Profil bearbeiten, Speicherbestätigung
- [x ] Ort/PLZ mit Autocomplete

---

*Diese Checkliste nach jeder großen Änderung aktualisieren. Neue Features als Abschnitt hinzufügen.*
