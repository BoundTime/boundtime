# Ideen-Agent – Informationsaustausch für Design-Agent

Dieses Dokument fasst zusammen, was der **Ideen-Agent** bislang gemacht hat und welche Ideen er vorgeschlagen hat. Es dient dem Informationsaustausch, wenn der Ideen-Agent mit dem Design-Agent zusammengeführt wird.

---

## 1. Rolle des Ideen-Agents

- Der Ideen-Agent **codet nie**. Er schreibt ausschließlich Prompts für den Hauptagenten (in `.cursor/PROMPT-HAUPTAGENT-IDEE.md`).
- Bei Unklarheiten fragt er beim Nutzer nach und rät nicht.
- Er analysiert die Website, recherchiert und schlägt Verbesserungsideen vor.
- Der Nutzer wählt aus; erst dann wird ein Prompt für den Hauptagenten verfasst.

---

## 2. Bisherige Tätigkeiten

1. **Erkundung der BoundTime-Website** (Codebase, Struktur, Features)
2. **Recherche** zu ähnlichen Plattformen (Chaster, Chastity Games, Boundfire, Kinkanauts) und gängigen Engagement-Features
3. **Überblick** erstellt über bestehende Features (Keuschhaltung, BoundDollars, Aufgaben, Belohnungen, Gamification, Entdecken, Social, Verifizierung usw.)
4. **10 Verbesserungs-Ideen** vorgeschlagen (siehe Abschnitt 3)
5. **Auswahl durch Nutzer** – 6 Punkte wurden gewählt
6. **Prompt für den Hauptagenten** in `.cursor/PROMPT-HAUPTAGENT-IDEE.md` geschrieben (mit den 6 ausgewählten Punkten)
7. Nach Nutzerwunsch: **Kein Schreiben in die Prompt-Datei**, ohne zuvor zu prüfen, ob sie leer ist

---

## 3. Alle vorgeschlagenen Ideen (10 Punkte)

### Umgesetzt / im Hauptagent-Prompt (Nutzer-Auswahl)

- **Zentrale Glocke (In-App-Benachrichtigungen):** Neue Nachricht, neuer Follower, Profilbesuch, Like (Post/Profil), Keuschhaltung: neue Aufgabe, Aufgabe wartet auf Dom-Bestätigung, Belohnungsanfrage, Frist läuft bald ab
- **Filter „Keyholder gesucht“ / „Sub gesucht“** in Entdecken (evtl. aus `looking_for` ableiten)
- **Verifizierte Doms** in der Entdecken-Ansicht stärker hervorheben
- **Fortschrittsbalken** BoundDollars bis zum Belohnungsziel (Dashboard, Keuschhaltungs-Detail)
- **Technische Vorbereitung i18n** (Mehrsprachigkeit, bald Erweiterung auf Englisch)

### Noch nicht umgesetzt / nicht ausgewählt

- **Onboarding & Ersteinführung:** Tutorial nach Registrierung, „Erste Schritte“-Checkliste
- **Feed & Community:** Eigene Feed-Seite mit Posts von Gefolgten, „Empfohlene Doms/Subs“, Lesezeichen für Profile
- **Keuschhaltung nutzerfreundlicher:** Erinnerung „Du hast noch X offene Aufgaben“, Übersicht „Meine Keuschhaltungs-Partner“
- **Vertrauen & Consent:** Einmaliger Consent-Check vor erstem Arrangement, Hinweis bei Unlock-Belohnungen
- **Info-Seiten:** „Was sind BoundDollars?“, „Erste Schritte als Sub/Dom“, „Sicher und konsensuell“
- **Switcher sichtbar machen:** Filter nutzen, evtl. Anzeige „aktuell eher als Dom/Sub“
- **Kleinere Verbesserungen:** Verifizierungs-Ablauf transparent erklären, Dark/Light Mode, i18n (bereits ausgewählt)

---

## 4. Kontext zu BoundTime

- **Plattform:** BDSM-Netzwerk, deutschsprachig, Fokus Keuschhaltung
- **Rollen:** Dom, Sub, Switcher
- **Kern-Feature:** Doms geben Subs Aufgaben → bei rechtzeitiger, zufriedenstellender Erledigung erhalten Subs **BoundDollars** → damit können sie **Belohnungen** bei den Doms kaufen
- **Wichtige Bereiche:** Keuschhaltung, Entdecken, Profil, Nachrichten, Aktivität (Besucher, Likes), Dom-Bereich (nur verifizierte Doms), Alben, Verifizierung
- **Bestehende Gamification:** Streaks, Badges (erste Woche, 100 BD, 30 Tage, 7-Tage-Streak, erste Belohnung)

---

## 5. Dateien und Konventionen

- **Prompts für den Hauptagenten (Idee):** `.cursor/PROMPT-HAUPTAGENT-IDEE.md`
- **Vor dem Schreiben:** Immer prüfen, ob die Datei leer ist. Wenn nicht leer: Nutzer informieren.
- **Nach Erledigung:** Der Hauptagent löscht den Inhalt der Prompt-Datei.

---

## 6. Hinweise für Design-Agent

- Der Design-Agent ist für **optisches Erscheinungsbild** zuständig und **codet nie**.
- Er schreibt Prompts und arbeitet mit dem Hauptagenten zusammen.
- Alle Ideen oben können Design-Aspekte haben (z. B. Glocke-UI, Fortschrittsbalken-Styling, Hervorhebung verifizierter Doms, Filter-UI, Onboarding-Screens).
- Die Startseite, das Dashboard, Entdecken und die Keuschhaltungs-Seiten sind zentrale Bereiche für visuelle Verbesserungen.

---

---

## 7. Erweiterte Rolle: Design-Agent + Kreativer Part

Der **Design-Agent** ist ab jetzt auch der **kreative Part** der Agenten:
- Er macht **Vorschläge**, was noch eingebaut werden kann.
- Er recherchiert **online**, wie erfolgreiche Plattformen im BDSM-Bereich es machen.
- Er codet **nie** – schreibt nur Prompts für den Hauptagenten.
- Nutzer wählt aus; erst dann wird ein Prompt verfasst.

---

## 8. Kreative Vorschläge (aus Recherche 2024/2025)

### Was erfolgreiche BDSM-Plattformen haben

| Plattform | Erfolgs-Features |
|-----------|------------------|
| **FetLife** (11 Mio. Nutzer) | Gruppen (176k), Events (22k), Writings, starke Community, Datenschutz, keine Datensammlung |
| **KinkD** | Profil-Verifizierung (Selfie-Video), ortsbasiertes Matching, private Alben, GDPR |
| **Whiplr** | Video-Chat, Sprachnachrichten, Foto-Sharing, Ende-zu-Ende-Verschlüsselung |
| **Recon** | Event-Kalender, Foren, GPS-basierte Treffs, validierte Profile |
| **WhipMate** | Tutorials, verifizierte Profile, Events, Bildungsfokus |
| **Chaster** (Keuschhaltung) | Extensions-System, Peer-Verifizierung, geteilte Locks, Timer, Verifikationsbilder |
| **BeMoreKinky** (2024) | 40+ Persönlichkeits-Quizze, Gamified Learning, Belohnungssysteme |
| **Switched** (2023) | Modernes UI, 23k+ Nutzer in Monaten, keine Shadow-Bans für Kink-Inhalte |

### Aktuelle Nutzer-Trends 2024/2025

- **Privacy First:** Granulare Sichtbarkeiten, Datenschutz, Ende-zu-Ende-Verschlüsselung
- **Authentische Profile:** Detaillierte Interessen, Rollen/Limits, Consent-Badges
- **Community & Discovery:** Bessere Matching-Algorithmen, Feed, Events, Filter nach Dynamik/Nähe
- **Bildung:** Gamified Kurse, Quizze, Tutorials, Sicherheits- und Consent-Hinweise
- **Scene Planning:** Vor- und Nachbereitung von Szenen (Sicherheit, Grenzen, Aftercare)

---

### Neue Ideen für BoundTime (priorisiert)

#### Hohe Priorität (Marktdifferenzierung, Nutzer wollen das)

1. **Events & Münche:** Kalender für lokale Treffen, Workshops, Parties – wie FetLife/Recon. BoundTime kann deutschsprachige Events bündeln.
2. **Bildungs-Inhalte:** Kurze Tutorials („Erste Schritte als Sub/Dom“, „BoundDollars erklärt“), evtl. gamified Quizze zu Consent, Sicherheit, Keuschhaltung.
3. **Verbesserte Privatsphäre:** Granulare Sichtbarkeit (Profil-Details nur für Follower/Freunde), Option für Ende-zu-Ende-Verschlüsselung bei Nachrichten.
4. **Feed-Seite:** Posts von Gefolgten, „Empfohlene Doms/Subs“, Lesezeichen für Profile – hält Nutzer länger auf der Plattform.

#### Mittlere Priorität (Engagement, Retention)

5. **Onboarding & Ersteinführung:** Tutorial nach Registrierung, „Erste Schritte“-Checkliste (bereits vorgeschlagen, noch nicht umgesetzt).
6. **Keuschhaltung nutzerfreundlicher:** Erinnerung „Du hast noch X offene Aufgaben“, Übersicht „Meine Keuschhaltungs-Partner“.
7. **Switcher sichtbar machen:** Filter „aktuell eher Dom/Sub“, Switcher in Entdecken hervorheben.
8. **Info-Seiten:** „Was sind BoundDollars?“, „Sicher und konsensuell“, „Erste Schritte“ – reduziert Abbruch, erhöht Vertrauen.

#### Nice-to-have (Langfrist)

9. **Video/Voice:** Sprachnachrichten, evtl. Video-Chat (wie Whiplr) – technisch aufwändig, aber starke Differenzierung.
10. **Scene Planning / Nachbereitung:** Optionale Checklisten vor/nach Arrangements (Sicherheit, Grenzen, Aftercare) – könnte als „Scene-Reflexion“ in Keuschhaltung integriert werden.
11. **Consent-Flow:** Einmaliger Consent-Check vor erstem Arrangement, Hinweis bei Unlock-Belohnungen.

---

### Design-relevante Punkte

- Glocke-UI, Fortschrittsbalken, Hervorhebung verifizierter Doms (bereits in Arbeit)
- Onboarding-Screens, Feed-Layout, Event-Karten, Bildungs-Cards
- Datenschutz- und Consent-Bereiche visuell klar und vertrauenswürdig gestalten

---

*Stand: Erweiterung um kreative Ideen-Rolle und Recherche 2024/2025*
