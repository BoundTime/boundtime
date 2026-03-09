# Erledigt: Profil-Prompt

- Restriction-Status nur bei Paarprofilen in Navbar angezeigt.
- Cuckymode-Banner: Nach Aufheben wird der State sofort auf „nicht aktiv“ gesetzt (vor und nach loadProfile), Banner zeigt korrekt „Cuckymode ist nicht aktiv“.

---

# Erledigt: Cuckymode – granulare Einschränkungen

**Kontext:** Cuckymode gilt für Paar-Accounts: Die Hotwife kann festlegen, was der eingeschränkte Partner (Cucky) nicht darf. Bisher gibt es nur eine globale Aktivierung („Schreiben nur nach Passwort“). Die Einstellungsseite soll um **mehrere konkrete Optionen** erweitert werden, die die Hotwife an- und abwählen kann.

**Anforderung:** In der Cuckymode-/Zugriffsbeschränkungs-Sektion (Einstellungen) sollen zusätzlich zur bestehenden „Cuckymode aktivieren“-Checkbox folgende **Einschränkungs-Optionen** angeboten werden (jeweils als Checkbox, nur sichtbar/bearbeitbar wenn Cuckymode aktiv ist bzw. für Paar-Profile):

1. **Keine Singlefrauprofile ansehen** – Der Cucky darf keine Profile von Single-Frauen (Einzelprofil + Frau) in Entdecken, Suche etc. sehen; entsprechende Profile werden ausgeblendet oder nicht geliefert.
2. **Keine Nachrichten lesen oder schreiben** – Der Cucky darf weder Nachrichten lesen noch schreiben (Konversationen/Nachrichten-Inhalte nicht anzeigen, Schreiben blockieren).
3. **Keine Paarprofile ansehen** – Der Cucky darf keine Paar-Profile (account_type = couple) sehen; diese werden in Listen/Entdecken ausgeblendet.
4. **Keine Bilder ansehen dürfen** – Der Cucky darf keine Bilder (Fotos, Galerien, Anhänge o. Ä.) ansehen; Zugriff auf Bild-Inhalte blockieren oder ausblenden.

**Technische Umsetzung (für Hauptagenten):**

- **Datenmodell:** Pro Paar-Profil die neuen Optionen speichern (z. B. neue Spalten in `profiles`: `restriction_no_single_female_profiles`, `restriction_no_messages`, `restriction_no_couple_profiles`, `restriction_no_images` – alle boolean, default false). Oder ein JSONB/Array, wenn bevorzugt. Nur für `account_type = 'couple'` relevant; Abwärtskompatibilität: wenn nicht gesetzt, wie bisher behandeln.
- **Backend:**  
  - **Profile anzeigen:** Bei Abfragen (Entdecken, Suche, Profil-Listen) für den eingeschränkten User (Cuckymode aktiv, ggf. ohne Unlock) Profile herausfiltern: Single-Frauen und/oder Paare je nach gesetzter Option aus dem Ergebnis entfernen (RLS oder API-Logik).  
  - **Nachrichten:** RLS/API für `messages` und ggf. `conversations`: Wenn „Keine Nachrichten lesen oder schreiben“ gesetzt ist, dem Cucky keine Nachrichteninhalte zeigen und Insert blockieren.  
  - **Bilder:** Alle Stellen, an denen Bilder (Fotos, Galerien, Anhänge) geladen oder angezeigt werden, prüfen: Wenn „Keine Bilder ansehen“ gesetzt ist, keine Bild-URLs/-Inhalte ausliefern oder Zugriff verweigern (API/RLS).
- **Einstellungs-UI:** In der Cuckymode-Sektion (z. B. `SettingsRestrictionSection`) unter der Checkbox „Cuckymode aktivieren“ die vier neuen Checkboxen anzeigen (nur für Paar-Profile, nur für den berechtigten Nutzer). Labels wie oben; Speichern über bestehende oder erweiterte RPC/API (z. B. `set_restriction_password` um Parameter erweitern oder neue RPC für Restriction-Flags). Beim Speichern aktuelles Passwort verlangen, wenn Cuckymode bereits aktiv ist.
- **Frontend:** Entdecken, Nachrichten, Profil-/Bild-Seiten so anpassen, dass die Beschränkungen durchgesetzt werden (keine angezeigten Profile/Bilder/Nachrichten, wenn die jeweilige Option aktiv ist).

**Umsetzung:** Vier Checkboxen + Datenmodell + RPC/API; Entdecken filtert Single-/Paar-Profile und blendet bei „Keine Bilder“ Avatare aus (Initialen); Nachrichten-Layout/Seiten blockieren bei „Keine Nachrichten“ (Hinweis + keine Liste); Galerien/Anhänge bei „Keine Bilder“ optional erweiterbar.

---

# Erledigt: Cuckymode-Passwort – einmal festlegen, bleibt bis zur Änderung

- **Backend (078):** Bei Reaktivierung (Hash existiert) verlangt die RPC aktuelles Passwort; Hash wird nur bei expliziter Übergabe von `p_password` geändert.
- **Erstes Aktivieren:** Nur wenn noch kein Passwort gesetzt ist, wird „Passwort festlegen“ angezeigt; Texte erklären „bleibt bis Passwort ändern“.
- **Reaktivieren:** Wenn Passwort existiert, nur „Aktuelles Passwort zur Bestätigung“; kein neues Passwort.
- **Aufheben:** Aktuelles Passwort nötig; Hinweis „Das Passwort bleibt gespeichert“.
- **Passwort ändern:** Button „Passwort ändern“ (wenn Passwort gesetzt), öffnet Modal (wie Freischalten) mit Aktuelles Passwort + Neues Passwort, Buttons „Ändern“ und „Abbrechen“. Nur dort wird der Hash aktualisiert.

---

# Erledigt: Recovery-E-Mail entfernen, Bestätigungsmail, Button „Passwort vergessen“

- **Recovery-E-Mail:** Feld und Label aus der Cuckymode-UI entfernt; keine Anzeige und keine Speicherung mehr (`p_recovery_email: null`). DB-Spalte bleibt vorerst.
- **Bestätigungsmail:** Bei erster Einrichtung (erstes Aktivieren mit Passwort) wird `POST /api/me/restriction/send-setup-confirmation` aufgerufen; die Route sendet bei gesetztem `RESEND_API_KEY` eine Bestätigungs-E-Mail an die Account-E-Mail.
- **Passwort vergessen:** Button „Passwort vergessen“ neben „Passwort ändern“, immer sichtbar wenn `restriction_password_hash` gesetzt (aktiv oder inaktiv). Ruft `POST /api/me/restriction/forgot-password` auf; bei `RESEND_API_KEY` wird eine Hinweis-Mail versendet.
