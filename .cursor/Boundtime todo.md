# BoundTime.de – Cursor To-do Liste

> Gesammelt aus der Website-Analyse. Punkte werden laufend ergänzt.
> Status: [ ] offen | [x] erledigt

---

## 🔴 Kritisch

- [ ] **Dropdowns Schritt 2 reagieren nicht auf Mausklick** – Die `<select>`-Felder für Geschlecht und Rolle lassen sich per Mausklick nicht stabil befüllen: Auswahl springt zurück auf „Bitte wählen" oder überspringt Optionen. Ursache: React-State wird durch native DOM-Events nicht aktualisiert. Nur Tastatur-Navigation (ArrowKeys) funktioniert. Auf Mobilgeräten bricht das komplett. Fix: `onChange`-Handler korrekt verdrahten oder Custom-Select-Komponente verwenden.

- [ ] **Kein Redirect nach Login** – Nach erfolgreichem Login bleibt die URL auf `/login`. Die Navbar aktualisiert sich zwar (zeigt den eingeloggten Nutzer), aber es erfolgt kein automatischer Redirect zum Dashboard. Nutzer müssen manuell navigieren. Fix: nach erfolgreicher Authentifizierung `router.push('/dashboard')` o.ä. aufrufen.

---

## 🟠 Mittel

- [x] **Falscher Link „Über BoundTime"** – Auf der Startseite (`/`) linkt „Über BoundTime" auf `/community-regeln`. Sollte auf `/ueber-uns` zeigen.

- [x] **Cookie-Banner erscheint bei jeder Navigation** – `localStorage`-Check für den dismissten Banner funktioniert nicht korrekt. Beim Seitenwechsel wird der Banner erneut angezeigt, obwohl er bereits weggeklickt wurde.

- [x] **Schreibfehler „BoundTime- Features"** – In Navigation, Footer und Seitentiteln steht durchgehend ein Leerzeichen vor dem Bindestrich. Korrigieren zu: `BoundTime-Features`.

- [x] **Redundante Quick-Links auf Startseite** – Die 5 Quick-Links im Hauptinhalt (Über BoundTime, Was sind BoundTime-Features?, Community-Regeln, Funktionen & Ablauf, Datenschutz) duplizieren die Navigation. Entweder entfernen oder durch sinnvollen Content/Teaser ersetzen.

- [ ] **Kein Standortfeld im Registrierungsprozess** – Ort/PLZ wird während der Registrierung nicht abgefragt, obwohl Standort für eine Dating-/Community-Plattform zentral ist. Nutzer wissen nicht, dass sie das nachträglich im Profil ergänzen müssen. Entweder in Schritt 3 ergänzen oder nach der Registrierung einen klaren Hinweis/Redirect zur Profilkompletion zeigen.

- [ ] **Doppelter Hinweistext im Profil-Editor** – Auf `/dashboard/profil/bearbeiten` erscheint zweimal hintereinander fast derselbe Satz: „Alle Angaben sind freiwillig. Nur du entscheidest, was du preisgibst." und direkt darunter „Alle Angaben sind freiwillig. Du kannst Felder leer lassen und jederzeit anpassen." Einen der beiden Sätze entfernen oder zu einem zusammenfassen.

---

## 🟡 Klein / Nice-to-have

- [ ] **Hamburger-Menü auf Desktop** – Button „Menü öffnen" ist auf Desktop-Breiten sichtbar neben der vollständigen Nav. Auf Desktop per CSS ausblenden (`hidden md:hidden` o.ä. prüfen).

- [ ] **Google Fonts Self-Hosting** – Plus Jakarta Sans wird aktuell von Google-Servern geladen, noch vor Cookie-Consent. Font lokal hosten (z. B. via `next/font` oder statisches self-hosting) um DSGVO-konform zu sein.

- [ ] **Aria-Label für Logo-Link** – Der Logo-Link `href="/"` hat keinen Linktext für Screen Reader. `aria-label="BoundTime – Startseite"` ergänzen.

- [ ] **Impressum & AGB in der Hauptnavigation** – Aktuell nur im Footer verlinkt. Für rechtliche Sichtbarkeit zumindest „Impressum" in die Header-Nav oder prominent auf der Startseite verlinken.

- [ ] **Nick-Feld fehlt im Accessibility Tree** – Das Nick-Inputfeld (`id="nick"`, `type="text"`) taucht nicht als interaktives Element im Accessibility Tree auf. Screen Reader könnten das Feld übersehen. `aria-label` oder korrektes `<label for="nick">` sicherstellen.

- [ ] **Keine visuelle Fortschrittsanzeige bei Registrierung** – Der Schritt-Counter ist nur Text („SCHRITT 1 VON 3"). Eine visuelle Step-Indicator-Leiste (z. B. 3 Punkte/Linien) würde die UX deutlich verbessern.

- [ ] **Geburtsdatum: Widerspruch zwischen Darstellung und Input-Typ** – Das Feld zeigt den Placeholder `tt.mm.jjjj` (deutsches Format), ist aber `type="date"` (ISO-Format intern `YYYY-MM-DD`). Der Browser rendert je nach System unterschiedlich. Sicherstellen dass das Format konsistent deutsch angezeigt wird, oder auf ein Text-Input mit Validierung wechseln.

- [ ] **Schreibfehler „Profil-Identitaet"** – Das Badge auf der Profilseite zeigt „Profil-Identitaet" ohne Umlaut. Korrigieren zu „Profil-Identität".

---

## 📋 Noch offen / zu besprechen

*(Weitere Punkte folgen nach Login-Analyse des Mitgliederbereichs)*