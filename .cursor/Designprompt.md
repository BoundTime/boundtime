# Designprompt

Prompts für den Hauptagenten. **Nach Umsetzung nur den Prompt-Inhalt (ab „# Prompt:“) löschen, diese Bemerkung hier nicht.**

**Bemerkung für den Hauptagenten (bleibt immer stehen):** Nachdem der Prompt umgesetzt worden ist, soll der Hauptagent **im Chat** reinschreiben, was alles geändert worden ist, und eine **Checkliste** auflisten, was genau geändert wurde. So hat der Nutzer einen Überblick, was er alles testen muss. Diese Bemerkung wird nicht gelöscht.

---

**Ideen für später (nicht umgesetzt):** Verifizierte User könnten das Profil selbst gestalten (z. B. Schriftart wählen, evtl. Akzentfarbe, Anordnung; Auswahl aus mehreren Fonts, Größe, optional Layout-Optionen). Was genau möglich sein soll, später gemeinsam überlegen.

---

# Designprompt

Prompts für den Hauptagenten. **Nach Umsetzung nur den Prompt-Inhalt (ab „# Prompt:“) löschen, diese Bemerkung hier nicht.**

**Bemerkung für den Hauptagenten (bleibt immer stehen):** Nachdem der Prompt umgesetzt worden ist, soll der Hauptagent **im Chat** reinschreiben, was alles geändert worden ist, und eine **Checkliste** auflisten, was genau geändert wurde. So hat der Nutzer einen Überblick, was er alles testen muss. Diese Bemerkung wird nicht gelöscht.

---

**Ideen für später (nicht umgesetzt):** Verifizierte User könnten das Profil selbst gestalten (z. B. Schriftart wählen, evtl. Akzentfarbe, Anordnung; Auswahl aus mehreren Fonts, Größe, optional Layout-Optionen). Was genau möglich sein soll, später gemeinsam überlegen.

---

 

### 1.2 Betroffene Dateien (Cuckymode-Text vereinheitlichen)

1. `components/settings/SettingsRestrictionSection.tsx`
   - Den Einleitungstext unter `<h3 className="font-semibold text-white">Cuckymode</h3>` so anpassen, dass klar steht:
     - nur für Paare
     - Hotwife aktiviert und legt Passwort fest
     - Cucky ist dadurch beim Schreiben/Kommunizieren und (je nach Einstellungen) beim Ansehen von Bildern eingeschränkt
   - Die Checkbox-Überschrift „Zusätzliche Einschränkungen (was der Cucky nicht darf)“ beibehalten, aber die Erklärung davor muss „Hotwife + Paar + Passwort“ erwähnen.
   - Die kurzen Hinweise rund um „Passwort festlegen / Passwort ändern / Cuckymode aufheben“ sprachlich an die neue Grundbotschaft angleichen (ohne Technikdetails, kurz und verständlich).

2. `lib/restriction-context.tsx`
   - Im Entsperr-Modal (Titel + Absatz) ergänzen, dass es das **Cuckymode-Paarpasswort** ist und dass es zum **Schreiben/Kommunizieren** dient.

3. `components/RestrictionDot.tsx`
   - Tooltip-Texte so kürzen/angleichen, dass sie nicht nur „Passwort nötig zum Schreiben“ sagen, sondern auch „für Cuckymode“ klarer machen (z. B. „Cuckymode aktiv – Passwort nötig“).

4. `components/RestrictionBanner.tsx`
   - Bannertext so anpassen, dass es kurz erklärt, dass es um Cuckymode für das **Paar** geht und dass du/der Cucky mit Passwort (Freischalten) wieder schreiben kann.

5. `components/albums/ProfileAlbumsSection.tsx`
   - Text „Bilder sind im Cuckymode für dich eingeschränkt …“ minimal anpassen, sodass klar ist: das ist eine Cuckymode-Einschränkung für das Paar (nicht nur generisch „für dich“).

6. Optional (falls weitere sichtbare Copy-Warnungen existieren):
   - `app/(app)/dashboard/nachrichten/page.tsx`
   - `app/(app)/dashboard/nachrichten/[id]/page.tsx`
   (Texte nur anpassen, wenn dort die Bedeutung „Cuckymode für Paare“ missverständlich ist.)

## 2) Keuschhaltung: Männer keusch halten lassen, Aufgaben -> BD verdienen, BD -> Belohnungen kaufen (Damen), Beispiel Cage-Freilassung

### 2.1 Grundbotschaft (Text)

Keuschhaltung soll inhaltlich so erklärt werden:
- es geht darum, dass **Männer** sich von **Damen** oder **dominanten Herren** keuschhalten lassen können
- das Ganze funktioniert über **Aufgaben** und die **Ausführung**
- für erledigte Aufgaben können Keuschlinge **BD (BoundDollars)** verdienen
- für diese BD können sie dann **Belohnungen kaufen**, die die Damen anbieten
- Beispiel: **zeitlich begrenzte Freilassung aus dem Cage**

### 2.2 Betroffene Dateien (Inhalt anpassen)

1. `app/(public)/boundtime-features/page.tsx`
   - Abschnitt „Begriffe verständlich erklärt“ aktualisieren:
     - `<strong>Cuckymode</strong>` Beschreibung nach der neuen, klaren Paar/Hotwife/Passwort-Regel umformulieren (kurz, verständlich).
     - `<strong>Keuschhaltungs-Vereinbarungen</strong>` so ändern, dass Aufgaben + Keuschlinge + BD-Verdienen erkennbar sind (nicht nur „Regeln/Dauer/Umsetzung“).
     - `<strong>Bound-Dollars</strong>` so ändern, dass klar ist:
       - BD werden für Aufgaben/Erledigungen verdient
       - BD dienen als „Währung“ für Belohnungen
       - Beispiel „Freilassung aus dem Cage“
   - Dabei bitte auch die bereits geplanten Sprach-/Konsistenzkorrekturen NICHT vergessen (falls noch nicht umgesetzt):
     - `h1` korrekt/lesbar (nicht `boundtime-features`)
     - `BoundDollars` ohne Bindestrich
     - kein führendes Leerzeichen in `<strong>strenge Prüfung</strong>`

2. `components/chastity/ChastityStartForm.tsx`
   - Placeholder/Beispiel für „Beschreibung der Belohnung“ anpassen, sodass mindestens ein Beispiel wie „zeitlich begrenzte Freilassung aus dem Cage“ vorkommt.
   - (Wortlaut kurz halten, nicht zu explizit, aber konzeptionell klar.)

3. `components/chastity/ChastityAcceptRequestForm.tsx`
   - Placeholder „z.B. …“ ebenfalls mit Cage-Freilassung als Beispiel ergänzen/ersetzen.

### 2.3 Akzeptanzkriterien

- [ ] Cuckymode-Text in `SettingsRestrictionSection.tsx` erklärt klar: nur für Paare, Hotwife aktiviert, Passwort geschützt, Cucky ist dadurch beim Schreiben und (je nach Auswahl) beim Ansehen anderer Bilder eingeschränkt.
- [ ] Banner/Tooltip/Modal zum Cuckymode sind konsistent und nicht widersprüchlich (kein „nur Schreiben“ behaupten, wenn im UI auch Bild-Einschränkungen existieren; wenn nötig, nur entsprechend eingeschränkt formulieren).
- [ ] `boundtime-features/page.tsx` erklärt Keuschhaltung mit: Männer -> Keuschhalten lassen -> Aufgaben -> BD verdienen -> BD -> Belohnungen kaufen (Damen) inkl. Beispiel „Cage-Freilassung“.
- [ ] In den Belohnungs-Formular-Placeholders taucht das Beispiel „Freilassung aus dem Cage“ sichtbar auf.

Nach Umsetzung: Nur den Inhalt ab „# Prompt:“ bis hierher in dieser Datei löschen; Überschrift „Designprompt“ und die Bemerkungen für den Hauptagenten bleiben stehen.
