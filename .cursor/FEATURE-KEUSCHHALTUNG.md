# Feature: Keuschhaltung (Chastity) – Dom/Sub Aufgaben, Punkte, Belohnung

Dieses Dokument beschreibt die **Grundfunktion Keuschhaltung** in BoundTime: Ein Sub (oder Cuckold) wird von einer Dom(me)/Herrin in Keuschheit gehalten; die Dom(me) vergibt Aufgaben mit Frist und Punkten; bei genug Punkten kann der Sub seine vorher vereinbarte Belohnung „abholen“.

---

## 1. Rollen und Ablauf (aus Nutzersicht)

- **Sub / Keuschling:** Möchte keusch gehalten werden (z.B. mit Keuschheitsgürtel), wird von einer **Herrin/Dom(me)** überwacht.
- **Dom(me) / Herrin:** Überwacht den Sub, **erteilt Aufgaben** mit **Frist** (bis wann erledigt). Für erledigte Aufgaben erhält der Sub **Punkte**.
- **Belohnungsziel:** Dom und Sub legen vorher fest: **Ab X Punkten** darf der Sub seine **Belohnung** abholen (z.B. „wieder frei / selbst befriedigen“, „ein Treffen“, oder was auch immer vereinbart).
- **Ablauf:** Sub erledigt Aufgaben → sammelt Punkte → bei Erreichen des Ziels: **Belohnung abholen** (einmalig oder Runde endet; nächste Runde = neues Ziel, Punkte ggf. zurück auf 0).

---

## 2. Funktionen im System

| Funktion | Wer | Beschreibung |
|----------|-----|---------------|
| **Vereinbarung starten** | Dom + Sub | Dom und Sub gehen eine „Keuschhaltung-Vereinbarung“ ein (Dom überwacht Sub). Dazu: Belohnungsziel (Punkteanzahl) und Beschreibung der Belohnung festlegen. |
| **Aufgaben erteilen** | Dom | Dom erstellt **Aufgaben** für den Sub: Beschreibung, **Frist (Datum)**, **Punkte** bei Erledigung. |
| **Aufgabe erledigen** | Sub (oder Dom bestätigt) | Sub markiert Aufgabe als erledigt (bis Frist). Punkte werden dem Sub gutgeschrieben. |
| **Punkte anzeigen** | Beide | Sub und Dom sehen den aktuellen **Punktestand** und das **Belohnungsziel** (z.B. „45 / 100 Punkte“). |
| **Belohnung abholen** | Sub (ggf. mit Freigabe der Dom) | Wenn Punkte ≥ Ziel: Sub kann „Belohnung abholen“. Danach: Punkte auf 0 setzen (neue Runde) oder Vereinbarung pausieren/beenden. Die konkrete Belohnung wurde vorher zwischen Dom und Sub festgelegt (nur Text im System). |

---

## 3. Datenmodell (Überblick für Implementierung)

- **Vereinbarung (Arrangement):** Verknüpft Dom und Sub. Enthält: Belohnungsziel (Punkte), Beschreibung der Belohnung, aktueller Punktestand des Sub, Status (z.B. angefragt/aktiv/pausiert/beendet).
- **Aufgaben (Tasks):** Pro Vereinbarung. Enthält: Titel/Beschreibung, Frist (Datum), Punkte bei Erledigung, Status (offen/erledigt/verpasst/abgebrochen), wann erledigt, von wem erstellt (Dom).
- **Ablauf:** Sub markiert Aufgabe als erledigt → Punkte werden addiert. Bei Punkte ≥ Ziel: Button „Belohnung abholen“ → Punkte zurücksetzen (oder Runde beenden), Belohnung als „abgeholt“ protokollieren.

Details (Tabellennamen, Spalten) stehen im Prompt für den Hauptagenten.

---

## 4. Einordnung in BoundTime

- Diese Funktion ist eine **Grundfunktion** der App (nicht nur „später“). Sie nutzt die bestehenden **Profile** (Dom/Sub/Rolle) und setzt voraus, dass Dom und Sub sich **gegenseitig finden** (z.B. über Entdecken) und eine Vereinbarung eingehen können.
- Rechtlich/DSGVO: Nur für eingeloggte, erwachsene Nutzer; klare Zustimmung beider Parteien (Anfrage → Annahme) für eine Vereinbarung.

---

---

## 5. Darstellung & Platzierung (Stand Nutzerwunsch)

- **Option C:** Keuschhaltung ist **Hero auf dem Dashboard** (erster großer Block) **und** eigener Punkt in der **Hauptnavigation** (gleichwertig zu Entdecken).
- **Anbieten/Bitten unabhängig von „Was sucht du“:** Keuschhaltung anbieten (Dom) bzw. um Keuschhaltung bitten (Sub) soll von jedem Profil aus möglich sein – auch wenn die Person im Profil nicht „Keyholderin suchen“ / „Keuschhalten anbieten“ angekreuzt hat. Buttons auf der Profil-Detailseite also immer anzeigen (wenn Rolle passt: Dom sieht bei Sub/Switcher „Anbieten“, Sub sieht bei Dom/Switcher „Bitten“).
- **Landing:** BDSM-Seite allgemein präsentieren, auf Keuschhaltung hinweisen – **ohne** Formulierung wie „Frauen halten Männer keusch“. Neutrale, inklusive BDSM-Darstellung.
- **Profil „Was sucht du“:** Sub kann angeben: will keusch gehalten werden, sucht Keyholderin. Dom kann angeben: bietet Keuschhaltung an / ist Keyholder. (Zusätzliche Optionen in der Mehrfachauswahl.)
- **Schloss-Symbol:** Zeigt an, ob jemand **gerade verschlossen** ist (in aktiver Keuschhaltung). **Sub-Dashboard:** Ein Schloss mittig; wenn verschlossen: Anzeige der **Dauer** (X Monate, Y Tage, Z Stunden, Minuten, Sekunden). **Dom-Dashboard:** Pro Keuschling ein Schloss mit Dauer; wenn noch kein Keuschling: ein (leeres) Schloss anzeigen. Dauer = Zeit seit Start der Verschlossenheit (z.B. `locked_at` in der Vereinbarung).

---

## 6. Erweiterungen (Stand Nutzerwunsch)

- **Vorgegebene Aufgaben:** Keyholder wählt aus einer Liste vordefinierter Aufgaben, klickt an → Aufgabe mit einem Klick vergeben (nur noch Frist setzen). Eigene Aufgaben weiterhin möglich.
- **Belohnungen:** Vordefinierte Belohnungen zum Anklicken + eigene Belohnungen erstellen.
- **Sub-Kachel Vorschau:** In der Vereinbarungs-Kachel des Sub: kleine Vorschau, welche Aufgaben noch offen sind.
- **Strafpunkte:** Wenn Sub Aufgabe nicht rechtzeitig erfüllt oder nicht zur Zufriedenheit der Dom: Punkteabzug (Strafpunkte). Dom kann „Strafpunkte vergeben“ klicken. current_points wird um den Strafbetrag reduziert (mind. 0).

---

*Referenz für Hauptagent und Assistent. Bei Änderungswünschen hier anpassen und Prompt ggf. aktualisieren.*
