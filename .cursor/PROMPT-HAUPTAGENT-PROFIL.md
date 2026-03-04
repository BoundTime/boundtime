# Prompt: Paar – pro Person Devot/Dominant/Switcher; Zugriffsbeschränkung sichtbar und deaktivierbar

## 1. Paar: Keine gemeinsame „Rolle“, sondern pro Person auswählbar (Devot, Dominant, Switcher)

**Anforderung:** Dem Paar soll keine einzelne Rolle zugewiesen werden. Stattdessen soll **pro Person** im Paar auswählbar sein, wie sie sich einordnet – z. B. **Devot**, **Dominant**, **Switcher** (oder vergleichbare Begriffe).

**Umsetzung:**
- Zwei getrennte Auswahlen für Paar-Profile:
  - **Erste Person** (z. B. die, die bei „couple_first_is“ als erste geführt wird, oder explizit „Person 1“ / Hotwife-Seite): Auswahl z. B. **Devot | Dominant | Switcher**.
  - **Zweite Person** (Partner: Cuckold-Seite bzw. Person 2): dieselbe Auswahl **Devot | Dominant | Switcher**.
- Technisch: Entweder neue Spalten in `profiles`, z. B. `couple_first_tendency` und `couple_partner_tendency` (Werte: `devot`, `dominant`, `switcher`), oder bestehende Felder umwidmen, falls heute eine „Paar-Rolle“ existiert. Die bisherige Logik mit `couple_type` (man_woman etc.) und `couple_first_is` (man/woman) kann unverändert bleiben; ergänzt wird nur die Tendenz pro Person.
- **UI:** Im Profil bzw. in den Einstellungen bei Paar-Accounts: Zwei klar beschriftete Auswahlen (z. B. „Du (erste Person)“ und „Partner / zweite Person“) mit Optionen Devot, Dominant, Switcher. Keine einzelne „Rolle für das Paar“ mehr, sondern zwei getrennte Zuordnungen.

---

## 2. Zugriffsbeschränkung: Status sichtbar und deaktivierbar

**Anforderung:**
- Es soll **klar sichtbar** sein, ob die Zugriffsbeschränkung **aktiviert** oder **nicht aktiviert** ist.
- Die Zugriffsbeschränkung soll **deaktiviert** werden können – z. B. wenn die Hotwife das Häkchen abwählt, damit der Cuckold wieder schreiben kann (ohne Passwort).

**Umsetzung:**
- **Sichtbarkeit des Status:** Im Bereich „Zugriffsbeschränkung“ (z. B. in den Einstellungen unter `SettingsRestrictionSection` oder vergleichbar) einen **deutlichen Hinweis** anzeigen:
  - Wenn aktiviert: z. B. „Aktuell: Zugriffsbeschränkung ist **aktiv** – Schreiben nur mit Passwort.“ (optisch hervorgehoben, z. B. Badge oder farbiger Text).
  - Wenn nicht aktiviert: z. B. „Aktuell: Zugriffsbeschränkung ist **nicht aktiv**.“
- **Deaktivieren:** Das bestehende Häkchen („Zugriff einschränken“ o. ä.) soll **in beide Richtungen** funktionieren:
  - **Abwählen** = Zugriffsbeschränkung ausschalten (`restriction_enabled = false`). Beim Speichern muss das Backend (z. B. `set_restriction_password` mit `p_enabled: false`) aufgerufen werden, damit die Beschränkung deaktiviert wird. Nur wer das aktuelle Restriction-Passwort kennt (z. B. Hotwife), darf die Einstellung ändern – das bleibt wie bisher.
  - Nach dem Abwählen und Speichern: Kein Schreibschutz mehr; der Cuckold kann wieder ohne Passwort schreiben.
- **Wo sichtbar:** Der Status (aktiv / nicht aktiv) und die Möglichkeit zum An- und Abschalten sollen in dem **selben Fenster/Bereich** liegen, in dem man das Restriction-Passwort festlegt – also in den Einstellungen unter „Zugriffsbeschränkung“, für Paar-Accounts. Kein verstecktes oder zweites Fenster nötig.

---

## 3. Navbar: Anzeige, ob erweiterte Zugriffsberechtigungen aktiv sind

**Anforderung:** Irgendwo in der **Navbar** soll sichtbar sein, ob gerade **erweiterte Zugriffsbeschränkung aktiv** ist oder nicht – damit man auf einen Blick sieht, ob „alles sicher“ ist oder ob der Cuckold eingeschränkt ist.

**Farb-Logik:**
- **Grün:** Alles in Ordnung – **keine** Zugriffsbeschränkung aktiv. Volle Rechte; niemand ist eingeschränkt.
- **Rot:** Achtung – Zugriffsbeschränkung ist **aktiv**. Der Cuckold könnte etwas tun, das er in diesem Modus eigentlich nicht darf (z. B. schreiben), wenn er das Passwort nicht eingegeben hat; oder aus Sicht der Hotwife: Es gilt Einschränkung.

**Umsetzung:**
- In der **Navbar** (z. B. neben dem Profilbild, dem Lock-Badge oder in der Kopfzeile) einen kleinen **Indikator** einbauen – nur sichtbar für **Paar-Accounts** (`account_type = 'couple'`).
- Der Indikator zeigt:
  - **Grün** (z. B. Punkt, Icon oder Badge), wenn `restriction_enabled = false` – keine Beschränkung aktiv.
  - **Rot**, wenn `restriction_enabled = true` – Beschränkung aktiv („Gefahr“ / Cuckold eingeschränkt).
- Optional: Tooltip oder kurzer Text beim Hover (z. B. „Zugriffsbeschränkung aktiv“ / „Keine Zugriffsbeschränkung“), damit die Bedeutung klar ist.
- Die Navbar muss den aktuellen Wert `restriction_enabled` kennen (z. B. aus Profil-Daten oder eigenem Abruf); bei Paar-Profilen anzeigen, bei Einzelprofilen den Indikator ausblenden.

---

## Kurz-Checkliste

- [ ] Paar: Zwei getrennte Auswahlen (Devot / Dominant / Switcher) pro Person; DB-Spalten oder bestehende Felder anpassen; UI in Profil/Einstellungen
- [ ] Zugriffsbeschränkung: Deutliche Anzeige „aktiv“ vs. „nicht aktiv“ in den Einstellungen
- [ ] Zugriffsbeschränkung: Deaktivieren möglich (Häkchen abwählen → Speichern → restriction_enabled = false)
- [ ] Navbar: Indikator für Paar-Accounts – Grün = keine Beschränkung, Rot = Beschränkung aktiv; optional Tooltip

---

**Nach Erledigung: Inhalt dieser Datei löschen.**
