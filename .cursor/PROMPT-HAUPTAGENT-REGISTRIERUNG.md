# Prompt: Registrierung – Bestätigungs-E-Mail erneut anfordern können

**Kontext:** Beim Anlegen eines neuen Accounts wird bereits eine Bestätigungs-/Verifizierungs-E-Mail verschickt. Es kann aber vorkommen, dass diese Mail nicht ankommt (Spam, Tippfehler, technisches Problem). In diesem Fall soll der User **selbstständig** eine neue Bestätigungs-Mail anfordern können, ohne den Support zu brauchen.

---

## 1. Button „Bestätigungs-E-Mail erneut senden“ / „E-Mail erneut senden“

- Nach der Registrierung (und ggf. auf der Login-/Verifizierungs-Warteseite) soll ein **Button** angezeigt werden, z. B.:
  - **„Bestätigungs-E-Mail erneut senden“** oder
  - **„E-Mail erneut senden“**
- Der Button ist sichtbar, solange der Account **noch nicht verifiziert** ist.
- Klick auf den Button löst das erneute Versenden der Verifizierungs-E-Mail an die beim Account hinterlegte E-Mail-Adresse aus.

**UI-Ideen:**

- Direkt unter dem Hinweis „Wir haben dir eine E-Mail geschickt…“ einen zusätzlichen Satz:
  - „Du hast keine E-Mail erhalten? Prüfe auch deinen Spam-Ordner oder **klicke hier, um die E-Mail erneut zu senden**.“
- Button gut sichtbar und klar beschriftet, ggf. mit kurzer Bestätigungsmeldung nach Klick („Wenn ein Konto mit dieser E-Mail existiert und noch nicht bestätigt ist, haben wir dir eine neue E-Mail geschickt.“).

---

## 2. Technisches Verhalten / Sicherheit

- Der Button sollte **nur** für Accounts funktionieren, die noch **nicht verifiziert** sind.
- Missbrauch vermeiden:
  - Anfragen drosseln (Rate-Limit pro E-Mail/Account/IP).
  - Antworttext **keine Information leaken**, ob es ein Konto gibt oder nicht (z. B. immer eine neutrale Erfolgsmeldung anzeigen).
- Implementierung z. B. über eine Route wie:
  - `POST /auth/resend-verification` oder ähnliche, die:
    - die aktuelle Session bzw. eingegebene E-Mail nutzt,
    - prüft, ob der Account unverifiziert ist, und
    - dann die Verifizierungs-E-Mail erneut verschickt (z. B. via Supabase/Resend o. ä.).

---

## 3. Kurz-Checkliste

- [ ] Nach Registrierung / auf der „Bitte E-Mail bestätigen“-Seite einen Button „Bestätigungs-E-Mail erneut senden“ einbauen.
- [ ] Klick sendet eine neue Verifizierungs-E-Mail an unverifizierte Accounts; Benutzer*in sieht eine neutrale Bestätigungsmeldung.
- [ ] Route/Backend schützt vor Missbrauch (Rate-Limit, kein Account-Leak).
- [ ] Button nur sichtbar, solange der Account noch nicht verifiziert ist (nach erfolgreicher Bestätigung verschwindet er).

**Nach Erledigung:** Diese Datei bzw. diesen Prompt entfernen oder als erledigt markieren.

