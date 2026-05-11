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
**Status:** [x] `min-h-screen` entfernt, unteres Padding reduziert (`pb-16` statt großer symmetrischer `py-*`)

---

### TODO-005 — BoundDollars & Keuschhaltungs-Sektion fehlt
**Datei:** `components/landing/FeatureShowcase.tsx`  
**Problem:** Die BoundDollars & Keuschhaltungs-Sektion (Feature 2 aus der Spec, Abschnitt 6.3) ist auf der Live-Seite nicht vorhanden. Nach dem Cuckymode-Block kommt direkt die Entdecken/Filter-Sektion — der BoundDollars-Block fehlt komplett.  
**Aufgabe:** Die BoundDollars-Sektion gemäß Abschnitt 6.3 der `LANDING_PAGE_SPEC.md` vollständig implementieren und zwischen dem Cuckymode-Block (6.2) und der Entdecken-Sektion (6.4) einfügen. Layout gespiegelt (Text rechts, Mockup links).  
**Status:** [x] Bereits in `FeatureShowcase.tsx` (Mockup links, Text rechts); ergänzt: CTA-Link zu `/boundtime-features#keuschhaltung-bounddollars` und Anker auf der Features-Seite

---