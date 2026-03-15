# Designprompt

Prompts für den Hauptagenten. **Nach Umsetzung nur den Prompt-Inhalt (ab „# Prompt:“) löschen, diese Bemerkung hier nicht.**

**Bemerkung für den Hauptagenten (bleibt immer stehen):** Nachdem der Prompt umgesetzt worden ist, soll der Hauptagent **im Chat** reinschreiben, was alles geändert worden ist, und eine **Checkliste** auflisten, was genau geändert wurde. So hat der Nutzer einen Überblick, was er alles testen muss. Diese Bemerkung wird nicht gelöscht.

---

# Prompt: Paarprofil – „Über mich“ beider Partner immer nebeneinander auf gleicher Höhe

## Ziel

Bei **Paarprofilen** (zwei Spalten: Frau / Mann) sollen die **„Über mich“-Texte** beider Partner **immer auf gleicher Höhe nebeneinander** beginnen – unabhängig davon, ob die **Vorlieben** darüber in der linken oder rechten Spalte mehr oder weniger Platz einnehmen (unterschiedlich viele Tags, unterschiedliche Höhe der Vorlieben-Blöcke).

## Problem

Aktuell hängt die Position von „Über mich“ in jeder Spalte von der Höhe des Vorlieben-Bereichs ab. Hat z. B. die linke Spalte (Frau) mehr Vorlieben-Tags als die rechte (Mann), beginnt „Über mich“ links weiter unten als rechts – die beiden „Über mich“-Blöcke sind dann **nicht horizontal auf einer Linie**.

## Betroffene Stellen

- **Fremdes Paarprofil:** `app/(app)/dashboard/entdecken/[id]/page.tsx` – Tab „Info“, Darstellung der zwei Partner-Karten (Frau / Mann).
- **Eigenes Paarprofil:** `app/(app)/dashboard/profil/page.tsx` – Tab „Info“, gleiche Zwei-Spalten-Darstellung.

## Konkrete Umsetzung

### Option A (empfohlen): Gleiche Mindesthöhe für den Vorlieben-Bereich

- In **beiden** Spalten (Frau-Karte, Mann-Karte) dem **Container der Vorlieben-Sektion** eine **einheitliche Mindesthöhe** geben (z. B. `min-h-[…]` in Tailwind, z. B. `min-h-[180px]` oder `min-h-[220px]`), sodass beide Vorlieben-Blöcke mindestens gleich hoch sind.
- Dadurch beginnen die **„Über mich“-Blöcke** in beiden Spalten auf **derselben vertikalen Position**; die Vorlieben können weiterhin unterschiedlich viele Tags haben (der eine Block hat dann mehr Weißraum unten).

### Option B: Grid mit gemeinsamer Zeile für „Über mich“

- Das Zwei-Spalten-Layout so umbauen, dass die **„Über mich“-Inhalte** beider Partner in einer **gemeinsamen Grid-Zeile** liegen (z. B. Grid mit zwei Spalten; Zeile 1: Kopf links, Kopf rechts; Zeile 2: Vorlieben links, Vorlieben rechts; Zeile 3: Über mich links, Über mich rechts). Die **Vorlieben-Zeile** so gestalten, dass beide Zellen die **gleiche Höhe** haben (z. B. `align-items: start` und der Vorlieben-Container hat `min-height` wie bei Option A, oder die Zeile hat eine feste/min-Höhe).

### Wichtig

- **Nur** die vertikale Ausrichtung der „Über mich“-Blöcke anpassen; Inhalt und Texte unverändert lassen.
- Auf **mobilen** Viewports (eine Spalte unter der anderen) bleibt die Reihenfolge logisch (z. B. Frau komplett, dann Mann komplett); die Ausrichtung auf gleicher Höhe betrifft vor allem **Desktop/Tablet** (zwei Spalten nebeneinander).

---

## Zusätzlich: Profile immer mittig ausgerichtet (Fremdprofil & Eigenprofil)

### Ziel

Aktuell wirkt die Profil-Ansicht **nicht mittig ausgerichtet** – viele Texte und Blöcke sind linksbündig. Die **gesamte Profil-Darstellung** (sowohl beim **Anschauen eines fremden Profils** als auch beim **eigenen Profil**) soll **durchgängig aus der Mitte** angeordnet sein: übersichtlich, symmetrisch und einheitlich mittig.

### Betroffene Ansichten (siehe Anhang-Beispiele)

- **Fremdes Profil:** `app/(app)/dashboard/entdecken/[id]/page.tsx` – Tab „Info“ (Paarprofil mit zwei Spalten Frau/Mann sowie die darunter liegenden Vollbreiten-Blöcke).
- **Eigenes Profil:** `app/(app)/dashboard/profil/page.tsx` – Tab „Info“ (gleiche Struktur: Kopf, ggf. zwei Partner-Karten, dann ORT, Wen sucht ihr?, Was sucht ihr?, Was vom Gegenüber erwartet wird?).

### Konkrete Vorgaben für mittige Anordnung

- **In den beiden Partner-Karten (Frau / Mann):**  
  Alle Inhalte **mittig** ausrichten: Überschriften (z. B. „Frau“, „Mann“, „VORLIEBEN“, „ÜBER MICH“), Alter, Personenangaben (Größe, Gewicht, Figur, Erfahrung), „Paar“-Hinweis, Vorlieben-Tags (`justify-center`), Über-mich-Text (`text-center`). Keine linksbündigen Blöcke mehr innerhalb der Karten.

- **Vollbreiten-Sektionen unterhalb der Karten:**  
  ORT, WEN SUCHT IHR?, WAS SUCHT IHR?, WAS VOM GEGENÜBER ERWARTET WIRD? (bzw. bei Einzelprofil die entsprechenden „Wen suchst du?“ etc.): **Überschrift und Inhalt mittig** ausrichten (`text-center`), damit die Profile insgesamt einheitlich aus der Mitte wirken.

- **Profil-Header (Name, Paarprofil, Ort, Follower, Buttons):**  
  Optional ebenfalls stärker zentrieren oder zumindest den Hauptinhalt (Name, Typ, Ort) mittig setzen, Buttons zentriert gruppieren – sofern es zum Gesamtbild passt und mit dem bestehenden Layout vereinbar ist.

- **Einzelprofil (kein Paar):**  
  Dieselben Regeln: Alle Kacheln und Sektionen im Tab „Info“ mit **mittiger Ausrichtung** von Überschriften und Inhalten.

### Akzeptanzkriterien (mittige Anordnung)

- [ ] Beim **fremden Profil** (Entdecken → Profil öffnen) und beim **eigenen Profil** (Profil → Tab „Info“) sind **Überschriften und Inhalte in den Karten und in den Vollbreiten-Sektionen mittig** ausgerichtet (kein durchgängiges Linksbündig).
- [ ] Vorlieben-Tags in den Karten sind mittig gebündelt; Personenangaben und „Über mich“ in den Karten mittig.
- [ ] Die Blöcke ORT, Wen/Was sucht ihr?, Erwartungen sind mittig formatiert (siehe Anhang-Beispiele für die betroffenen Bereiche).

---

## Akzeptanzkriterien (gesamter Prompt)

- [ ] Bei Paarprofil (zwei Spalten) beginnen die **„Über mich“-Überschrift und der Text** in der **linken und rechten Spalte auf derselben vertikalen Höhe** – unabhängig von der unterschiedlichen Höhe der Vorlieben-Sektionen darüber.
- [ ] Eigenes und fremdes Paarprofil (Tab „Info“) verhalten sich gleich.
- [ ] **Zusätzlich:** Profile (fremd + eigen) sind durchgängig **mittig ausgerichtet** (Karten-Inhalte und Vollbreiten-Sektionen wie in den Anhang-Beispielen).

Nach Umsetzung: Nur den Inhalt ab „# Prompt:“ bis hierher in dieser Datei löschen; Überschrift „Designprompt“ und die Bemerkung für den Hauptagenten bleiben stehen.

