# BoundTime — TODO-Liste für Cursor
> Punkte werden hier gesammelt und gebündelt an Cursor übergeben.
> Status: [ ] offen | [x] erledigt

---

## LANDING PAGE

### TODO-001 — Hero: Stat-Block "500+ Verifizierte Mitglieder" entfernen
**Datei:** `components/landing/HeroSection.tsx`  
**Problem:** Die angezeigte Zahl "500+" entspricht nicht der tatsächlichen Mitgliederzahl und ist damit irreführend.  
**Aufgabe:** Den gesamten Stat-Block (Element 6 aus der Spec — die drei Zahlen "500+", "3 Länder", "100%") vollständig entfernen. Keine Ersatz-Zahlen einbauen. Der Bereich unter den CTA-Buttons bleibt leer bzw. der vertikale Abstand wird entsprechend angepasst (`mb-0` statt `mt-12`).  
**Status:** [x] Bereits in der Live-Version umgesetzt

---

### TODO-002 — Hero: Floating Card "Paar_Berlin" entfernen
**Datei:** `components/landing/HeroSection.tsx`  
**Problem:** Die Floating Card "Paar_Berlin / Verifiziert / Trat gerade bei" (unten links am Hero-Bild) zeigt einen fiktiven Nutzer — das ist nicht authentisch und wirkt unglaubwürdig.  
**Aufgabe:** Die gesamte Floating Karte 2 (untere Karte, "Paar_Berlin") vollständig aus dem JSX entfernen. Die obere Floating Card ("Keuschhaltung aktiv / Bound: 14 Tage") bleibt bestehen — sie zeigt ein Feature, keinen Nutzer.  
**Status:** [x] Bereits in der Live-Version umgesetzt

---

### TODO-003 — Alle Abrechnungs- und Pricing-Hinweise entfernen
**Betroffene Dateien:** `components/landing/DiscretionSection.tsx`, `components/landing/FinalCTA.tsx`, gesamte Landing Page  
**Problem:** BoundTime ist derzeit vollständig kostenlos. Jegliche Erwähnung von Abrechnung, Kosten oder Pricing ist nicht zutreffend und soll nicht erscheinen.  
**Aufgabe:** Folgende Elemente vollständig entfernen:

1. `DiscretionSection.tsx` — Feature-Punkt "Diskrete Abrechnung" (inkl. Icon, H4 und Beschreibungstext) komplett entfernen. Die verbleibenden 3 Diskretions-Features rücken nach oben, Abstände anpassen (`space-y-6` bleibt).

2. `FinalCTA.tsx` — Mini-Trust-Item "Keine Kreditkarte nötig" entfernen. Die zwei verbleibenden Trust-Items lauten exakt: "Kostenlos registrieren" und "Kein Abo nötig".

3. Gesamte Landing Page — Alle Begriffe suchen und entfernen die Kosten implizieren: "Premium", "Upgrade", "Plan", "Abonnement", "Abrechnung", "Zahlung", "kündbar", "Kreditkarte". Keine dieser Wörter darf auf der Landing Page erscheinen.

**Status:** [x] Bereits in der Live-Version korrekt umgesetzt

---

### TODO-004 — Hero: Großes Leerareal zwischen CTA-Buttons und Trust Bar
**Datei:** `components/landing/HeroSection.tsx`  
**Problem:** Zwischen dem "Bereits Mitglied? Anmelden →" Text und der Trust Bar klafft ein sehr großer leerer schwarzer Bereich. Der Stat-Block (TODO-001) wurde entfernt aber der vertikale Abstand nicht angepasst — die Hero-Section hat dadurch zu viel ungenutzten Leerraum.  
**Aufgabe:** Den vertikalen Padding/Margin unter dem "Bereits Mitglied"-Text reduzieren. Konkret: `mt-12` oder `pb-32` auf `mt-4` bzw. `pb-16` reduzieren bis die Section kompakt wirkt und nahtlos in die Trust Bar übergeht. Kein unnötiger schwarzer Leerraum.  
**Status:** [x] Erledigt

---

### TODO-005 — BoundDollars & Keuschhaltungs-Sektion fehlt
**Datei:** `components/landing/FeatureShowcase.tsx`  
**Problem:** Die BoundDollars & Keuschhaltungs-Sektion (Feature 2 aus der Spec, Abschnitt 6.3) ist auf der Live-Seite nicht vorhanden. Nach dem Cuckymode-Block kommt direkt die Entdecken/Filter-Sektion — der BoundDollars-Block fehlt komplett.  
**Aufgabe:** Die BoundDollars-Sektion gemäß Abschnitt 6.3 der `LANDING_PAGE_SPEC.md` vollständig implementieren und zwischen dem Cuckymode-Block (6.2) und der Entdecken-Sektion (6.4) einfügen. Layout gespiegelt (Text rechts, Mockup links).  
**Status:** [x] Erledigt

---

## DASHBOARD (nach Login)

### TODO-006 — Komplettes Dashboard-Redesign mit Sidebar-Navigation
**Betroffene Dateien:** `app/dashboard/layout.tsx`, `components/dashboard/Sidebar.tsx` (neu), `components/dashboard/Topbar.tsx` (neu), `app/dashboard/page.tsx`  
**Problem:** Das aktuelle Dashboard hat eine schmale Top-Navigation mit 4 Links. Alle Features sind schwer erreichbar, kein Kontext zum eingeloggten User, kein Überblick beim ersten Blick. Das große BoundTime-Bild auf MyBound nimmt 60% des Platzes ohne Mehrwert.

**Aufgabe — Layout-Umbau:**

Das gesamte Dashboard-Layout wird von Top-Navigation auf ein 2-Spalten-Layout umgebaut:
- Linke Spalte: Sidebar (220px breit, fest, nicht scrollbar)
- Rechte Spalte: Content-Bereich (flex:1, scrollbar)
- Das Layout gilt für alle `/dashboard/*` Routen via `app/dashboard/layout.tsx`

**Sidebar — Aufbau von oben nach unten:**

1. Logo-Bereich (height: 56px, border-bottom):
   - BT-Signet (28x28px, border-radius 8px, bg #7B1111, weiße Schrift)
   - "BoundTime" Text daneben, font-weight 500, 14px

2. Profil-Schnellzugriff (padding 12px 16px, border-bottom, klickbar → /dashboard/profil):
   - Avatar-Kreis (36x36, bg #7B1111, Initialen des Nutzers, dynamisch aus Session)
   - Grüner Online-Indikator (9px Kreis, absolut unten rechts am Avatar, bg #22C55E)
   - Nutzername (13px, weight 500) + Rolle · Stadt (11px, muted) — beide aus Session
   - Chevron-Down Icon rechts

3. Haupt-Navigation (flex:1, padding-top 8px):
   Label "Hauptmenü" (10px, uppercase, muted, padding 8px 16px 4px)
   - MyBound → /dashboard (Icon: ti-home)
   - Entdecken → /dashboard/entdecken (Icon: ti-search)
   - Nachrichten → /dashboard/nachrichten (Icon: ti-messages) + roter Badge mit Anzahl ungelesener Nachrichten
   - Forum → /dashboard/forum (Icon: ti-users)

   Label "Features"
   - Keuschhaltung → /dashboard/keuschhaltung (Icon: ti-lock) + goldenes Pill-Badge "Aktiv" wenn Dynamik aktiv
   - Cuckymode → /dashboard/cuckymode (Icon: ti-eye)

4. Keuschhaltungs-Status-Widget (nur wenn aktive Dynamik vorhanden):
   - bg rgba(123,17,17,0.06), border rgba(123,17,17,0.2), border-radius 8px, padding 10px 12px, margin 8px
   - ti-lock Icon + "Bound: X / Y Tage" (11px, #7B1111, weight 500)
   - Fortschrittsbalken: height 4px, fill #7B1111, Prozent dynamisch aus Dynamik-Daten
   - "X Tage verbleibend" links + "XXX BD" rechts (goldfarben)
   - Klick → /dashboard/keuschhaltung

5. Bottom-Bereich (margin-top auto, border-top, padding 8px 8px 12px):
   - Einstellungen → /dashboard/einstellungen (ti-settings, 12px)
   - Verifizierung → /dashboard/profil/bearbeiten (ti-shield-check, 12px)
   - Abmelden (ti-logout, 12px, ruft signOut() auf)

**Aktiver Nav-Item Zustand:**
- Background: rgba(123,17,17,0.08)
- Icon: #7B1111
- Text: var(--color-text-primary), weight 500
- Margin: 1px 8px, border-radius: var(--border-radius-md)

**Topbar (height 50px, border-bottom, bg var(--color-background-primary)):**
- Links: Seiten-Titel dynamisch je nach Route ("MyBound", "Entdecken" etc.) — 15px, weight 500
- Rechts: Ghost-Button "Post erstellen" (ti-plus + Text) + Bell-Icon 32x32 mit rotem Dot bei ungelesenen Benachrichtigungen

**MyBound Home (app/dashboard/page.tsx) — komplett neu:**

Das große BoundTime Brand-Bild wird vollständig entfernt. Ersatz:

Block 1 — Begrüßung:
- "Guten [Morgen/Tag/Abend], [Username]" — 18px, weight 500
- "Hier läuft alles zusammen." — 13px, muted, margin-top 2px
- Tageszeit per JS: 5–11 Uhr = Morgen, 12–17 Uhr = Tag, 18–23 Uhr = Abend

Block 2 — Stats (grid-cols-4, gap 8px, margin-bottom 16px):
- Karte 1: Profilbesuche heute (Zahl aus API oder 0)
- Karte 2: Neue Nachrichten (Anzahl ungelesener Nachrichten)
- Karte 3: Tage gebunden (aus aktiver Keuschhaltungs-Dynamik, 0 wenn keine, Zahl in #7B1111)
- Karte 4: BoundDollars-Guthaben (Zahl in #8A6D2E = gedämpftes Gold)

Block 3 — Zwei-Spalten-Grid (grid-cols-2, gap 12px):
Linke Karte — Feed:
- Header: "Feed" + "Alle ansehen →" Link
- Post-Box: Textarea-Optik mit Placeholder "Was möchtest du teilen?"
- Aktionen: "Bild" Ghost-Button + "Posten" Button (bg #7B1111)
- Bestehende Posts darunter wenn vorhanden, sonst leerer State mit Entdecken-Link

Rechte Spalte — zwei gestapelte Karten:
Karte A — "Empfehlungen für dich":
- 2 Profil-Vorschläge: Avatar-Initialen + Name + Rolle · Distanz + "Folgen"-Button
- Basis: Profile aus Entdecken die noch nicht gefolgt werden

Karte B — "Wer hat dein Profil besucht":
- Letzte 2–3 Besucher: Avatar-Initialen + Name + Online-Dot + Zeitstempel
- "Alle ansehen →" Link

**Mobile (unter md: 768px):**
- Sidebar display:none
- Bestehende mobile Bottom-Navigation bleibt erhalten
- Topbar bleibt sichtbar (ohne "Post erstellen" Button — nur Titel + Bell)

**Status:** [x] Erledigt

---

### TODO-007 — Profil-Seite Redesign als Showcase
**Betroffene Dateien:** `app/dashboard/profil/page.tsx`, `app/dashboard/entdecken/[id]/page.tsx`
**Problem:** Das aktuelle Profil ist eine flache Informationsseite — Avatar 60px, keine visuelle Hierarchie, keine Galerie-Vorschau, Vorlieben-Tags ohne Farb-Differenzierung, Verifizierungs-Status kaum sichtbar. Es wirkt wie ein Formular, nicht wie ein Showcase.

**Aufgabe — Aufbau von oben nach unten:**

**1. Cover-Photo Bereich (height: 160px):**
- Standard-Background wenn kein Cover: dark gradient mit BoundTime-Atmosphäre (`linear-gradient(135deg, #1a0808, #2d0f0f)`) + subtiles diagonales Linienmuster (opacity 0.06, repeating-linear-gradient, #C8A951)
- Wenn Cover-Bild vorhanden: `object-fit: cover`, width 100%, height 100%
- Button "Cover ändern" (oben rechts, nur auf eigenem Profil): rgba(0,0,0,0.4) bg, 0.5px border rgba(255,255,255,0.15), 11px, ti-camera Icon

**2. Profil-Header (bg var(--color-background-primary), border-bottom, padding 0 20px 16px):**

Avatar:
- Größe: 80x80px (statt aktuell ~60px), border-radius 50%
- Border: 3px solid var(--color-background-primary) — hebt Avatar vom Cover ab
- Position: absolute, top -40px, left 20px — schwebt über Cover-Unterkante
- Online-Indikator: 14px Kreis, bg #22C55E, border 2.5px solid var(--color-background-primary), absolut unten rechts am Avatar

Actions-Reihe (display flex, justify-content flex-end, padding-top 10px):
- Nur auf eigenem Profil: "Alben"-Button (Ghost) + "Profil bearbeiten"-Button (bg #7B1111)
- Auf fremdem Profil: "Folgen"-Button + "Nachricht senden"-Button (bg #7B1111) + "Keuschhaltung anbieten"-Button (Ghost, nur wenn eigene Rolle Dom/Switcher)

Name-Reihe (margin-top 44px — Platz für schwebenden Avatar):
- Username: 18px, weight 500, color var(--color-text-primary)
- Verifiziert-Badge (inline, links): bg rgba(91,168,255,0.1), border rgba(91,168,255,0.3), color #5BA8FF, 11px, ti-check Icon — NUR wenn verifiziert
- Rollen-Badge (inline): Farben je nach Rolle (Dom = gold, Sub = muted lila, Bull = crimson, Switcher = violet, Hotwife = rose)

Meta-Zeile (12px, muted, flex gap-12):
- ti-map-pin + Stadt/PLZ
- ti-calendar + Alter in Jahren
- ti-clock + "Mitglied seit [Monat Jahr]"

Statistik-Leiste (inline-flex, border 0.5px, border-radius md, overflow hidden):
- 4 Pills nebeneinander mit border-right zwischen ihnen
- Follower | Folgt | Profilbesuche (nur eigenes Profil) | Tage gebunden (nur wenn aktive Dynamik, Zahl in #7B1111)
- Jede Pill: padding 6px 14px, Zahl 15px weight 500, Label 10px uppercase muted

**3. Profil-Body (grid-template-columns: 1fr 280px, bg var(--color-background-secondary)):**

Linke Spalte (border-right, padding 16px, gap 12px):

Card "Über mich":
- Fließtext aus Profil-Daten, 13px, line-height 1.6
- Leer-State: "Noch keine Beschreibung." in muted

Card "Vorlieben":
- Tags als Pills: bg rgba(123,17,17,0.06), border rgba(123,17,17,0.2), color #7B1111, 11px, font-weight 500, padding 4px 10px, border-radius 20px
- Maximal 8 Tags anzeigen, Rest hinter "X weitere" Link verstecken

Card "Fotos" (nur sichtbar wenn Album vorhanden):
- 3-spaltiges Grid, aspect-ratio 1:1, border-radius 6px, overflow hidden
- Hover: Overlay rgba(123,17,17,0.4) + ti-eye Icon zentriert, transition 0.15s
- Gesperrte Bilder (privates Album): dunkler Overlay + ti-lock Icon + "Privat" Text
- "Album öffnen" Link rechts im Card-Header

Rechte Spalte (padding 16px, gap 12px):

Card "Suche & Neigung":
- Tabellarische Zeilen (label + wert, border-bottom zwischen Zeilen)
- "Was gesucht" als farbige Tags (gold-toned: rgba(201,169,81,0.08), border rgba(201,169,81,0.2), color #8A6D2E)

Keuschhaltungs-Status-Card (nur wenn aktive Dynamik, bg rgba(123,17,17,0.05), border rgba(123,17,17,0.2)):
- "Aktive Keuschhaltung" Header mit ti-lock Icon in #7B1111
- Fortschrittsbalken (height 5px, fill #7B1111)
- "X / Y Tage" links + "XXX BD Belohnung" rechts (goldfarben)
- Klick → /dashboard/keuschhaltung (nur eigenes Profil)

Card "Profil-Infos":
- Profiltyp (Einzel / Paar)
- Erfahrung
- Online-Status (grüner Dot + "Online" / grauer Dot + "Zuletzt online [Zeit]")

**4. Gilt für beide Ansichten:**
- Eigenes Profil (/dashboard/profil): Edit-Buttons sichtbar, Profilbesuche sichtbar
- Fremdes Profil (/dashboard/entdecken/[id]): stattdessen Folgen + Nachricht senden Buttons, keine Profilbesuche-Zahl

**Status:** [x] Erledigt

---

### TODO-008 — Chat-System komplett neu bauen
**Betroffene Dateien:** `app/dashboard/nachrichten/page.tsx`, `components/dashboard/chat/ConversationList.tsx` (neu), `components/dashboard/chat/ChatWindow.tsx` (neu), `components/dashboard/chat/MessageBubble.tsx` (neu)
**Problem:** Die Nachrichten-Seite zeigt aktuell nur einen leeren State mit dem Text "Noch keine Unterhaltung." — kein UI, kein Input, keine Konversationsliste. Das ist der kritischste fehlende Baustein der Plattform.

**Aufgabe — Zwei-Spalten-Layout (height: 100%, overflow hidden):**

**Linke Spalte — Konversationsliste (width: 260px, border-right, bg var(--color-background-primary)):**

Header (padding 14px, border-bottom):
- "Nachrichten" Titel (14px, weight 500)
- Suchfeld (height 32px, border-radius md, bg var(--color-background-secondary), placeholder "Suchen...", 12px)

Konversations-Items (flex-direction column, padding 6px 0):
Jedes Item (display flex, gap 10px, padding 10px 14px, cursor pointer):
- Hover: bg var(--color-background-secondary)
- Aktiv (aktuell geöffnete Konversation): bg rgba(123,17,17,0.07)
- Avatar (38x38, border-radius 50%, Initialen des Gesprächspartners, Farbe je nach Rolle)
- Online-Indikator (9px, absolut unten rechts am Avatar): bg #22C55E wenn online, bg var(--color-border-secondary) wenn offline
- Rechts vom Avatar: Name (13px, weight 500) + Zeitstempel (10px, muted) oben; Vorschau letzte Nachricht (11px, muted, truncate) unten
- Ungelesene Badge (bg #7B1111, color #fff, 10px, min-width 17px, border-radius 20px) — nur wenn ungelesene Nachrichten

Leerer State (keine Konversationen):
- Zentriert: ti-messages Icon (28px, muted) + "Noch keine Nachrichten" (13px) + "Starte direkt aus Entdecken" (11px, muted) + Link zu /dashboard/entdecken

**Rechte Spalte — Chat-Fenster (flex:1, display flex, flex-direction column):**

Wenn keine Konversation ausgewählt (leerer State):
- Zentriert: ti-send Icon (32px, muted) + "Wähle eine Unterhaltung" (14px) + "oder starte eine neue aus Entdecken" (12px, muted)

Wenn Konversation aktiv:

Chat-Header (height 52px, border-bottom, bg var(--color-background-primary), padding 0 16px):
- Avatar (34x34) + Online-Indikator
- Name (13px, weight 500) + "Online" / "Zuletzt online [Zeit]" (11px, grün wenn online / muted wenn offline)
- Rechts: Profil-Button (ti-user, 30x30, Ghost) + Mehr-Button (ti-dots-vertical, 30x30, Ghost)

Nachrichten-Bereich (flex:1, padding 16px, overflow-y auto, bg var(--color-background-secondary), display flex, flex-direction column, gap 12px):

Tages-Trennlinie (display flex, align-items center, gap 8px):
- Linie links und rechts (flex:1, height 0.5px, bg var(--color-border-tertiary))
- Datum zentriert (10px, muted, "Heute" / "Gestern" / Datum)

Nachrichten-Zeile (display flex, gap 8px, align-items flex-end):
- Eigene Nachrichten: flex-direction row-reverse
- Fremde Nachrichten: normal

Bubble (max-width 280px, padding 9px 12px, font-size 13px, line-height 1.5):
- Fremde: bg var(--color-background-primary), border 0.5px var(--color-border-tertiary), color var(--color-text-primary), border-bottom-left-radius 3px
- Eigene: bg #7B1111, color #fff, border-bottom-right-radius 3px
- Zeitstempel (10px, muted) unter der Bubble
- Eigene: "✓✓ Gelesen" / "✓ Gesendet" in rgba(255,255,255,0.6), 10px

Bild-Nachricht: img max-width 200px, border-radius 8px, cursor pointer (öffnet Vollbild)

Tipp-Indikator (3 animierte Punkte, CSS animation bounce): nur sichtbar wenn Gesprächspartner tippt

Input-Bereich (padding 12px 16px, border-top, bg var(--color-background-primary), display flex, gap 8px, align-items center):
- Bild-Button (ti-photo, 32x32, Ghost-Border) — öffnet File-Picker
- Text-Input (flex:1, height 36px, border-radius md, bg var(--color-background-secondary), placeholder "Nachricht schreiben...", 13px)
- Senden-Button (36x36, border-radius md, bg #7B1111, ti-send Icon weiß) — disabled wenn Input leer

**Technische Anforderungen:**
- Nachrichten werden über bestehende API-Route geladen (falls vorhanden) oder als Platzhalter-Struktur vorbereitet
- Neue Nachricht: POST an bestehende Nachrichten-API
- Echtzeit-Updates (Polling alle 5s als Minimum, WebSocket wenn verfügbar)
- Scroll to bottom beim Öffnen einer Konversation und beim Empfang neuer Nachrichten
- Enter-Taste sendet Nachricht (Shift+Enter = Zeilenumbruch)

**Mobile (unter md):**
- Konversationsliste = Vollbild
- Tippen auf Konversation → Chat-Fenster als Vollbild mit Zurück-Button

**Status:** [x] Erledigt

---

### TODO-009 — Entdecken: Karten-Grid mit Filter-Bar
**Betroffene Dateien:** `app/dashboard/entdecken/page.tsx`, `components/dashboard/entdecken/ProfileCard.tsx` (neu), `components/dashboard/entdecken/FilterBar.tsx` (neu)
**Problem:** Das aktuelle Entdecken zeigt Profile als schlichte Liste mit 8 Dropdown-Selects in einer Reihe. Keine visuellen Karten, keine Quick-Actions, kein modernes Grid-Layout.

**Aufgabe:**

**Filter-Bar (ersetzt die bisherige Dropdown-Reihe):**
- Horizontale Pill-Buttons, overflow-x: auto, gap 6px
- Rolle-Filter: "Alle Rollen" (default aktiv) | "Dom" | "Sub" | "Switcher" | "Bull" — je ein Pill
- Aktiver Pill: bg rgba(123,17,17,0.08), border rgba(123,17,17,0.3), color #7B1111, font-weight 500
- Inaktiver Pill: transparent bg, border var(--color-border-tertiary), color var(--color-text-secondary)
- Separator (0.5px vertikal) vor den Zusatz-Filtern
- "Nur Verifiziert" Toggle-Pill (ti-shield-check Icon)
- "Umkreis: XXkm" Pill — klick öffnet PLZ-Eingabe
- "Alle Filter" Button rechts außen (ti-adjustments-horizontal, bg var(--color-background-secondary)) — öffnet erweitertes Filter-Panel
- Grid/Listen-Umschalter oben rechts (zwei Buttons, aktiver = bg #7B1111)

**Profil-Karten Grid (grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)), gap 12px, padding 16px):**

Jede Karte (border-radius lg, border 0.5px var(--color-border-tertiary), overflow hidden, cursor pointer):
- Hover: border-color rgba(123,17,17,0.4)

Karten-Bild (height: 148px, position relative, overflow hidden):
- Wenn Profilfoto vorhanden: next/image, object-fit cover
- Wenn kein Foto: Initialen-Placeholder (großer Buchstabe, farbiger Hintergrund je nach Rolle)

Hover-Layer (position absolute, inset 0, opacity 0 → 1 bei hover, transition 0.2s):
- gradient: linear-gradient(to top, rgba(8,3,3,0.82) 0%, rgba(8,3,3,0.3) 55%, transparent 100%)
- Dunkelt das Bild ab damit Buttons gut lesbar sind

Badges (position absolute, top 8px, left 8px, display flex, gap 4px):
- Verifiziert: "✓ Verifiziert" — bg rgba(30,60,120,0.85), color #91c0ff, border rgba(91,168,255,0.4)
- Online: "● Online" — bg rgba(10,60,30,0.85), color #6ee7a0, border rgba(34,197,94,0.4)
- Neu (Mitglied < 7 Tage): "★ Neu" — bg rgba(100,75,10,0.85), color #f0c060, border rgba(201,169,81,0.4)

Quick-Action Buttons (position absolute, bottom 10px, zentriert, opacity 0 → 1 + translateY(6px → 0) bei hover, transition 0.2s):
- "Schreiben" Button: bg #7B1111, color #fff, font-weight 600, padding 7px 14px, border-radius 20px, font-size 12px, box-shadow 0 2px 8px rgba(0,0,0,0.5)
- "Folgen" Button: bg rgba(255,255,255,0.18), color #fff, border 1.5px solid rgba(255,255,255,0.55), gleiche Größe

Karten-Body (padding 10px 12px 12px):
- Name (13px, weight 500) + Distanz mit ti-map-pin Icon (11px, muted) — flex justify-between
- Tags (Rolle + bis zu 2 Vorlieben): pills wie gehabt, font-size 10px
- Stadt (11px, muted, ti-map-pin Icon)

**KEIN Match-Score** — wird nicht angezeigt.

**Listenansicht (Umschalter):** Bestehende Listenansicht bleibt als Alternative erhalten, wird nicht verändert.

**Status:** [x] Erledigt

---

### TODO-010 — Keuschhaltungs-Hub: Dedizierte Seite mit Countdown & Timeline
**Betroffene Dateien:** `app/dashboard/keuschhaltung/page.tsx`, `components/dashboard/keuschhaltung/ActiveDynamik.tsx` (neu), `components/dashboard/keuschhaltung/Countdown.tsx` (neu), `components/dashboard/keuschhaltung/Timeline.tsx` (neu), `components/dashboard/keuschhaltung/BoundDollarsCard.tsx` (neu)
**Problem:** Die aktuelle Keuschhaltungs-Seite ist nur ein Formular zum Starten neuer Dynamiken. Keine laufende Dynamik sichtbar, kein Countdown, kein BoundDollars-Guthaben, keine History.

**Aufgabe — Zwei-Spalten-Layout (grid-template-columns: 1fr 280px):**

**Topbar:** "Keuschhaltung" Titel + "Neue Dynamik" Button (bg #7B1111, ti-plus Icon, border-radius 20px)

**Linke Spalte — Haupt-Content:**

Block 1 — Aktive Dynamik Card (nur wenn Dynamik aktiv, bg var(--color-background-primary), border rgba(123,17,17,0.25), border-radius lg):
- Roter Akzent-Balken oben (height 3px, bg #7B1111)
- Header: Label "Aktive Dynamik" (10px, uppercase, #7B1111) + Partner-Name (16px, weight 500) + Startdatum (12px, muted) + Status-Badge "Gebunden" (pill, bg rgba(123,17,17,0.1), color #7B1111)
- Countdown (4 Einheiten: Tage / Stunden / Minuten / Sekunden):
  - Jede Einheit: bg var(--color-background-secondary), border-radius md, padding 12px 8px, text-align center
  - Zahl: 26px, font-weight 500, color #7B1111, font-variant-numeric tabular-nums
  - Label: 10px, uppercase, muted
  - Countdown läuft per setInterval(1000) in Echtzeit
- Fortschrittsbalken:
  - "Fortschritt der Dynamik" + Prozentzahl rechts
  - Track: height 8px, bg rgba(123,17,17,0.1), border-radius 4px
  - Fill: bg #7B1111, width dynamisch (vergangene Tage / Gesamttage * 100%)
  - Shine-Effekt am Fill-Ende: 3px weißes Element rechts
  - Darunter: "Tag X von Y" links + "Noch Z Tage" rechts (11px, muted)
- Belohnungs-Karte (bg rgba(201,169,81,0.05), border rgba(201,169,81,0.2), border-radius md, padding 12px 14px):
  - ti-gift Icon in goldener Box + "Belohnung bei Erfüllung" Label + Belohnungstext + BD-Betrag

Block 2 — Verlauf (Timeline, nur wenn Events vorhanden):
- Section-Title "Verlauf" mit ti-timeline Icon
- Jedes Timeline-Item: Dot (10px, farbig je nach Event-Typ) + vertikale Linie zum nächsten + Text + Zeitstempel
- Event-Typen und Dot-Farben:
  - Dynamik gestartet: #7B1111
  - BoundDollars vergeben: #8A6D2E
  - Meilenstein erreicht: #1D9E75
  - Abgeschlossene alte Dynamik: var(--color-border-secondary)

Block 3 — Neue Dynamik Formular (immer sichtbar, unter der Timeline):
- Bestehende Formular-Felder bleiben, optisch an neues Design angepasst

**Rechte Spalte:**

BoundDollars-Card (bg var(--color-background-primary), border, border-radius lg, padding 16px):
- Header: Münz-Icon (32x32, bg rgba(201,169,81,0.1)) + "BoundDollars" Label
- Großer Betrag: 28px, weight 500, color #8A6D2E
- Subtext: "Dein aktuelles Guthaben"
- Transaktions-History (border-top, padding-top 10px, gap 6px):
  - Jede Zeile: Beschreibung (12px) + Betrag (+XX in grün / −XX in rot) — flex justify-between
  - Die letzten 5 Transaktionen

Dynamik-Details Card (bg var(--color-background-primary), border, border-radius lg, padding 14px):
- Tabellarische Zeilen (label + wert, border-bottom):
  - Partner, Laufzeit, Verbleibend (rot), BD bei Erfüllung (gold), Status (rot)

**Leerer State (keine aktive Dynamik):**
- Zentriertes leeres State in der Hauptspalte: ti-lock Icon + "Keine aktive Dynamik" + "Starte eine neue Dynamik oben" (12px, muted)
- Formular bleibt sichtbar

**Status:** [x] Erledigt

---

### TODO-011 — MyBound Home: Komplett neu aufbauen
**Betroffene Dateien:** `app/dashboard/page.tsx`, `components/dashboard/home/StatsRow.tsx` (neu), `components/dashboard/home/FeedCard.tsx` (neu), `components/dashboard/home/KeuschhaltungWidget.tsx` (neu), `components/dashboard/home/SuggestionsCard.tsx` (neu), `components/dashboard/home/VisitorsCard.tsx` (neu)
**Problem:** Das aktuelle MyBound zeigt ein großes BoundTime-Markenbild das 60% der Seite einnimmt und keinen Mehrwert hat. Kein Willkommens-Element, keine Quick-Stats, keine Empfehlungen.

**Aufgabe — Layout: 2 Spalten (grid-template-columns: 1fr 268px)**

**Topbar:**
- Titel "MyBound" (15px, weight 500)
- "Post erstellen" Ghost-Button rechts (ti-plus, border, 12px)
- Bell-Icon (32x32, border) mit rotem Dot wenn ungelesene Benachrichtigungen

**Linke Haupt-Spalte (padding 20px, gap 16px):**

Block 1 — Begrüßung:
- "Guten [Morgen/Tag/Abend], [Username]" — 19px, weight 500
- "Hier läuft alles zusammen — dein Feed, deine Dynamiken, deine Verbindungen." — 13px, muted
- Tageszeit per JS: 5–11 Uhr = Morgen, 12–17 Uhr = Tag, 18–23 Uhr = Abend

Block 2 — Stats-Reihe (grid-template-columns: repeat(4, minmax(0, 1fr)), gap 8px):
WICHTIG: Alle 4 Kacheln müssen `min-width: 0` und `overflow: hidden` haben damit Text nicht überläuft.
- Jede Kachel: bg var(--color-background-primary), border 0.5px, border-radius md, padding 10px
- Zahl: 20px, weight 500, line-height 1.2
- Label: 10px, uppercase, letter-spacing 0.04em, muted, word-break: break-word, hyphens: auto
- Kachel 1: "12" + "Profilbesuche" (Zahl aus API, heute)
- Kachel 2: "3" + "Neue Nachrichten" — Zahl in #7B1111 wenn > 0
- Kachel 3: "14" + "Tage Bound" — Zahl in #7B1111, aus aktiver Dynamik, 0 wenn keine
- Kachel 4: "340" + "BoundDollars" — Zahl in #8A6D2E (gold)

Block 3 — Feed-Card (bg var(--color-background-primary), border, border-radius lg):
- Header: "Feed" (13px, weight 500) + "Alle ansehen →" Link
- Compose-Bereich: Avatar (32x32, #7B1111) + Textarea-Box "Was möchtest du teilen?" (bg secondary, border, border-radius md)
- Actions: "Bild" Ghost-Button (ti-photo) + "Posten" Button rechts (bg #7B1111, border-radius md, 12px)
- Wenn Feed leer: zentrierter Empty-State mit ti-users Icon + "Dein Feed ist noch leer" + Subtext + "Entdecken" Button (bg #7B1111, border-radius 20px)
- Wenn Feed hat Posts: Posts rendern (bestehende Feed-Logik übernehmen)

**Rechte Seiten-Spalte (padding 20px, gap 14px):**

Widget 1 — Keuschhaltung (nur wenn aktive Dynamik):
- bg rgba(123,17,17,0.05), border rgba(123,17,17,0.2), border-radius lg, padding 14px, cursor pointer → /dashboard/keuschhaltung
- Header: ti-lock Icon (#7B1111) + "Keuschhaltung" (13px, weight 500, #7B1111) + "Aktiv" Badge (pill, rgba(123,17,17,0.1))
- "mit [Partner] · noch X Tage" (12px, muted)
- Fortschrittsbalken (height 5px, fill #7B1111, dynamisch)
- Footer: "Tag X / Y" links + "XXX BD ›" rechts (goldfarben)

Widget 2 — Empfehlungen (bg primary, border, border-radius lg):
- Header: ti-sparkles Icon + "Empfehlungen" + "Mehr →" Link
- 3 Profil-Items (padding 10px 14px, border-bottom, hover bg secondary):
  - Avatar (34x34, Initialen, farbig) + Online-Dot + Name + Rolle · Distanz + "Folgen" Ghost-Button
  - Basis: Profile die noch nicht gefolgt werden, sortiert nach Distanz

Widget 3 — Profilbesuche (bg primary, border, border-radius lg):
- Header: ti-eye Icon + "Profilbesuche" + "Alle →" Link
- 3 Besucher-Items (padding 9px 14px, border-bottom, hover bg secondary):
  - Avatar-Initialen (30x30) + Online-Dot + Name (flex:1, min-width:0, truncate) + Zeitstempel (flex-shrink:0)
  - Online = grüner Dot (#22C55E), Offline = grauer Dot

**Das große BoundTime Brand-Bild wird vollständig entfernt — kein Ersatz.**

**Status:** [x] Erledigt

---

---

## OFFENE PUNKTE — Nach Cursor-Feedback (Dashboard)

### TODO-012 — Sidebar: Profilfoto fehlt im Profil-Schnellzugriff
**Datei:** `components/dashboard/Sidebar.tsx`
**Problem:** Im Profil-Schnellzugriff der Sidebar wird nur ein Initialen-Kreis angezeigt. Wenn der User ein Profilfoto hochgeladen hat, muss dieses dort erscheinen — nicht die Initialen.
**Aufgabe:**
- Profilfoto aus Session/API laden (`user.profileImage` oder äquivalentes Feld)
- Wenn Foto vorhanden: `<Image>` mit `object-fit: cover`, border-radius 50%, 36x36px
- Wenn kein Foto: Initialen-Fallback wie bisher (bg #7B1111, Initialen weiß)
- Gleiches Verhalten wie Avatar auf der Profilseite (TODO-007)
**Status:** [x] Erledigt — `avatarUrl` aus Supabase in `layout.tsx` abgerufen und an `DashboardSidebar` übergeben; Sidebar zeigt Profilfoto wenn vorhanden, sonst Initialen-Fallback.

---

### TODO-013 — Navigation: Sidebar-only, keine doppelte Navbar
**Betroffene Dateien:** `components/dashboard/Topbar.tsx`, `app/dashboard/layout.tsx`
**Problem:** Aktuell gibt es zwei Navigationsbereiche — die bestehende Top-Navigation und die neue Sidebar. Das ist redundant und verwirrend. Außerdem stoßen beide optisch in der oberen linken Ecke zusammen.
**Entscheidung:** Die Sidebar-Navigation ist die primäre und einzige Navigation. Die alte Top-Navbar entfällt vollständig.

**Aufgabe Teil 1 — Alte Top-Navbar entfernen:**
- Die bestehende Top-Navigation (mit MyBound / Entdecken / Forum / Einstellungen Links) vollständig aus `app/dashboard/layout.tsx` entfernen
- Kein Ersatz — die Sidebar übernimmt alle Navigationspunkte

**Aufgabe Teil 2 — Topbar neu definieren:**
Die Topbar (height 50px, border-bottom) bleibt erhalten, bekommt aber einen anderen Zweck — sie ist jetzt eine reine Kontext-Leiste, keine Navigation:
- Links: Seiten-Titel der aktuellen Route (z.B. "MyBound", "Entdecken", "Nachrichten") — 15px, weight 500 — dynamisch per `usePathname()`
- Mitte: leer (kein Logo, keine Links)
- Rechts: "Post erstellen" Ghost-Button + Bell-Icon mit Dot — wie bisher

**Aufgabe Teil 3 — Visuelle Ecke fixen:**
Das Zusammenstoßen der beiden Navbars in der oberen linken Ecke verschwindet automatisch wenn die alte Top-Navbar entfernt wird. Falls noch ein visuelles Artefakt bleibt:
- Sicherstellen dass die Sidebar nahtlos von oben bis unten geht (height: 100vh oder 100%)
- Sidebar-Logo-Bereich (56px) und Topbar (50px) haben unterschiedliche Höhen — dies angleichen: beide auf 56px setzen damit die horizontale Trennlinie der Topbar exakt mit der Unterkante des Sidebar-Logo-Bereichs fluchtet

**Status:** [x] Erledigt — Alte Top-Navbar existierte nicht mehr; Topbar-Höhe auf 56px angeglichen (war 50px); `DashboardTopbar` neu implementiert mit Desktop (56px) und Mobile (44px) Layout.

---

## MOBILE VERSION

### TODO-014 — Mobile: Vollständige Analyse und Redesign-Spec
**Status:** [x] Analyse durchgeführt, vollständige Spec in TODO-015 ausgearbeitet — dieser Punkt ist abgedeckt.

---

### TODO-015 — Mobile: Vollständige Mobile-UX Spec
**Breakpoint:** alles unter `md` (768px)
**Grundprinzip:** Sidebar komplett weg, Bottom-Navigation ersetzt sie.

---

**A) Bottom-Navigation (gilt global für alle /dashboard/* Routen):**
```
Position: fixed, bottom: 0, left: 0, right: 0
Height: 56px
Background: var(--color-background-primary)
Border-top: 0.5px solid var(--color-border-tertiary)
z-index: 50
Display: flex, align-items: center, justify-content: space-around
Padding-bottom: env(safe-area-inset-bottom) — für iPhone Notch
```

5 Nav-Items (jeweils flex-direction column, align-items center, gap 2px, flex:1, padding 6px 0):
1. Home → /dashboard — Icon: ti-home
2. Entdecken → /dashboard/entdecken — Icon: ti-search
3. Chat → /dashboard/nachrichten — Icon: ti-messages + roter Badge-Dot wenn ungelesene Nachrichten
4. Bound → /dashboard/keuschhaltung — Icon: ti-lock + goldener Dot wenn Dynamik aktiv
5. Profil → /dashboard/profil — Icon: ti-user

Aktiver Item: Icon + Label in #7B1111, font-weight 500, bg rgba(123,17,17,0.08), border-radius 8px
Inaktiver Item: Icon + Label in var(--color-text-tertiary)
Label: 9px, nur auf Mobile sichtbar

Content-Bereich: padding-bottom: 56px (damit nichts hinter Bottom-Nav verschwindet)

---

**B) Mobile Topbar (height: 44px statt 50px auf Mobile):**
- Links: BT-Signet (22x22, border-radius 6px, #7B1111) + Seiten-Titel (13px, weight 500)
- Rechts: 2 kontextabhängige Icons (maximal 2, je 18px):
  - MyBound: Bell (mit rotem Dot) + Plus (Post erstellen)
  - Entdecken: Adjustments-Filter Icon
  - Nachrichten: Edit-Icon (neue Unterhaltung)
  - Keuschhaltung: Plus (neue Dynamik)
  - Profil: Dots-Vertical (Mehr-Optionen)

---

**C) MyBound Home Mobile:**
- Begrüßungstext: 15px weight 500 (kleiner als Desktop)
- Stats-Grid: grid-template-columns: 1fr 1fr (2 Spalten statt 4) — alle 4 Kacheln in 2x2
- Keuschhaltungs-Widget: Vollbreite, kompakter (padding 10px)
- Feed-Card: Vollbreite, Compose-Bereich vereinfacht (nur Textarea + Posten-Button)
- Empfehlungen + Besucher: untereinander, keine rechte Spalte

---

**D) Entdecken Mobile:**
- Filter-Bar: horizontal scrollbar, Pills kleiner (font-size 10px, padding 4px 10px)
- Filter-Icon rechts in der Topbar öffnet ein Bottom-Sheet mit allen Filtern
- Grid: grid-template-columns: 1fr 1fr (2 Spalten) — keine 4-spaltige Ansicht
- Karten-Höhe Bild: 90px (statt 148px)
- Quick-Action Buttons ("Schreiben"/"Folgen"): beim Antippen der Karte erscheint Bottom-Sheet mit Profil-Preview + Buttons — kein Hover auf Mobile

---

**E) Nachrichten Mobile:**
- Konversationsliste = Vollbild (width: 100%)
- Antippen einer Konversation → Chat-Fenster als neue "Seite" (push navigation)
- Chat-Fenster Header: Zurück-Button (ti-arrow-left) links + Avatar + Name + Online-Status
- Input-Bereich: sticky am unteren Rand, berücksichtigt Tastatur (env(safe-area-inset-bottom))

---

**F) Profil Mobile:**
- Cover: height 90px (statt 160px)
- Avatar: 56px (statt 80px)
- Actions-Buttons: unter dem Header, vollbreite Zeile (flex, gap 8px)
- Statistik-Leiste: 3 statt 4 Pills (Profilbesuche weglassen auf fremdem Profil)
- Profil-Body: eine Spalte (kein 2-Spalten-Grid)
- Karten untereinander: Über mich → Vorlieben → Suche & Neigung → Keuschhaltungs-Status → Profil-Infos

---

**G) Chat-Fenster Mobile (wenn Konversation geöffnet):**
- Vollbild, keine Konversationsliste sichtbar
- Header: ti-arrow-left → zurück zur Liste
- Input sticky bottom + safe-area-inset

---

**Allgemeine Mobile-Regeln:**
- Alle touch-targets minimum 44x44px
- Keine Hover-Effekte — stattdessen active states (scale 0.97)
- Font-sizes: nie unter 11px auf Mobile
- Kein horizontales Overflow — alles innerhalb des Viewports

**Status:** [x] Erledigt — BottomNav: 5 Einträge (Home, Entdecken, Chat, Bound, Profil) in Crimson #7B1111, kein center Plus-Button mehr, 9px Labels, aktiver Zustand mit rgba(123,17,17,0.08); Mobile Topbar (44px) mit BT-Signet und kontextabhängigen Icons; responsive Profile (Cover 90px/160px, Avatar 56px/80px), Entdecken-Grid 2 Spalten mobil, Karten-Bildhöhe 90px/148px, Filter-Pill-Größen angepasst; Begrüßungstext 15px mobil; Nachrichten-Höhe korrigiert.

---