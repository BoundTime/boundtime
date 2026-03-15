# Agentprompt

Prompts für den Hauptagenten. **Nach Umsetzung nur den Prompt-Inhalt (ab „# Prompt:“) löschen, diese Bemerkung hier nicht.**

**Immer gültig (nicht löschen):** Nach der Umsetzung eines Prompts schreibt der Hauptagent **in den Chat**, was alles geändert wurde, und listet eine **Checkliste** der konkreten Änderungen auf – damit du einen Überblick hast, was du testen musst.

---

# Prompt: Zweitort (aktueller Aufenthaltsort) + Profil-Ort bereinigen + Label-Texte anpassen

## 1. Zweiter Ort / aktueller Aufenthaltsort

**Idee:** Jeder User soll einen **zweiten Ort** angeben können, an dem er sich **gerade** befindet – z. B. im Urlaub. Das erleichtert Dates und macht es möglich, sich am aktuellen Ort finden zu lassen.

**Anforderung:**

- **Neues optionales Feld** im Profil: ein **„Zweitort“** bzw. **„Aktueller Aufenthaltsort“** (Bezeichnung im UI bitte passend wählen, z. B. „Aktuell hier“, „Derzeitiger Aufenthaltsort“, „Zweitort“). Nur anzeigen, wenn ausgefüllt.
- **Speicherung:** Zweiter Ort getrennt vom Haupt-Ort (Wohnort/PLZ) speichern (z. B. eigene Spalte `current_location` / `secondary_place` oder PLZ + Ort; Datenmodell je nach bestehender Ort-Struktur).
- **Sichtbarkeit:** Der zweite Ort muss **als solcher erkennbar** sein – also in der Anzeige klar machen, dass es der **zweite/aktuelle** Ort ist (z. B. Label „Aktuell hier:“, „Derzeit:“ oder „Zweitort:“), nicht mit dem Haupt-Ort verwechselt werden. Wo Profile gelistet oder angezeigt werden (Entdecken, Profilseite), optional beide Orte anzeigen bzw. bei Suche/Filter den Zweitort berücksichtigen.

**Kurz:** Zweitort optional erfassbar, in der UI als zweiter/aktueller Ort gekennzeichnet; ggf. für Suche/Filter nutzbar.

---

## 2. Redundante Ortsangabe im Profil entfernen

**Anforderung:** Die **Ortsangabe** beim **Profilfoto** (bzw. im Kopfbereich des Profils) bleibt. Die **weitere Ortsangabe weiter unten** im Profil (doppelte Nennung) soll **entfernt** werden – eine Angabe reicht, die zweite ist überflüssig.

**Umsetzung:** In der Profil-Ansicht (eigenes und fremdes Profil) die Ortsanzeige, die „weiter unten“ im Profil steht, entfernen; nur die Ortsangabe im oberen Bereich (z. B. beim Profilbild/Header) beibehalten.

---

## 3. Label-Texte im Profil anpassen

**Anforderung:** Folgende Formulierungen sollen geändert werden (einheitliche, neutrale Form mit „…“):

- **„Wen Suchst du“** bzw. „Wen suchst du?“ → **„Wen sucht …?“** („…“ steht für die Person; einheitliche Schreibweise.)
- **„Was suchst du?“** → **„Was sucht …?“**
- **„Was erwartest du von deinem Gesuchten?“** → **„Was erwartet … von seinem Gesuchten?“** („…“ für die Person, „seinem“ neutral/3. Person.)

Die genauen Platzierungen (wo die Labels im Profil stehen) bleiben; nur die **Texte** werden wie oben ersetzt. „Wen sucht …?“ soll **weiter oben** im Profil stehen (falls es aktuell weiter unten ist, Position nach oben verschieben).

**Kurz-Checkliste:**

- [ ] Zweitort / aktueller Aufenthaltsort: optionales Feld, in Anzeige als zweiter Ort erkennbar; Datenmodell + UI.
- [ ] Redundante Ortsangabe weiter unten im Profil entfernen; nur eine Ortsanzeige (oben) behalten.
- [ ] Labels: „Wen sucht …?“, „Was sucht …?“, „Was erwartet … von seinem Gesuchten?“; „Wen sucht …?“ weiter oben platzieren.

