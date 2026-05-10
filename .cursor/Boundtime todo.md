# BoundTime.de – Cursor To-do Liste

> Gesammelt aus der Website-Analyse. Punkte werden laufend ergänzt.
> Status: [ ] offen | [x] erledigt

---

## 🔴 Kritisch – Offen

- [ ] **„Was sucht" & „Wen sucht" nicht auf dem Profil sichtbar** – Im Profil-Editor kann man einstellen wen und was man sucht (Mann, Beziehung, Treffen vor Ort usw.), aber diese Angaben erscheinen nirgendwo auf der öffentlichen Profilseite. Andere User sehen also nicht, wen jemand sucht – auf einer Dating-/Community-Plattform ist das ein zentraler Mangel. Fix: Info-Sektion auf dem Profil ergänzen (z. B. „Sucht: Mann · Beziehung · Langzeit").

- [ ] **Rolle nicht änderbar ohne Erklärung** – Das Feld „Rolle" im Profil-Editor ist grau/read-only, ohne jeden Hinweis warum oder wo man sie ändern kann. User, die ihre Rolle korrigieren wollen (z. B. von Dom zu Switcher), finden keine Möglichkeit. Fix: Entweder Rolle editierbar machen oder Tooltip/Link ergänzen: „Rolle kann unter Einstellungen geändert werden."

- [ ] **Keine geführte Profilkompletion nach Registrierung** – Nach der E-Mail-Bestätigung landen neue User direkt auf dem leeren Profil ohne jede Orientierung. Es gibt keinen Onboarding-Flow, keinen Fortschrittsbalken, keine Checkliste. Gerade für eine Nischen-Community wo Profiltiefe entscheidend ist, ist das ein kritisches UX-Problem. Fix: Nach erstem Login einen Step-by-Step Profilassistenten anzeigen (Foto, Ort, Rolle, Vorlieben, Über mich), der abgehakt werden kann.

---

## 🟠 Mittel – Offen

- [ ] **„Was sucht"-Optionen logisch inkonsistent** – Im Abschnitt „Was sucht Hotwife_2019?" werden zwei grundverschiedene Dinge vermischt: Rollen die man bei anderen sucht (z. B. „Sklave/Sklavin") und Absichten/Formate (z. B. „Beziehung", „Treffen vor Ort"). Dazu kommen Optionen die beschreiben was man selbst anbietet (z. B. „Keuschhalten anbieten (Keyholder)"). Das ist für neue User extrem verwirrend. Fix: Klare Trennung in zwei Untersektionen: „Ich suche jemanden, der…" (Rolle des anderen) und „Ich suche…" (Kontaktformat/Ziel).

- [ ] **„Neigung" nicht auf Profil sichtbar** – Die sexuelle Orientierung (Hetero/Bi/etc.) wird im Editor gesetzt, aber auf dem öffentlichen Profil nicht angezeigt. Für viele User ist das eine wichtige Filterinformation. Fix: Neigung in der Profil-Info-Sektion anzeigen.

- [ ] **Profilbild-Einrichtung nicht intuitiv** – Um ein Profilbild zu setzen, muss man erst ins Hauptalbum navigieren, dort ein Foto hochladen und dann „Als Profilbild" klicken. Das ist ein 3-Schritte-Umweg, der nirgendwo erklärt wird. Der Profil-Editor verweist nur mit einem kleinen Link auf das „Hauptalbum". Fix: Direkt-Upload im Profil-Editor oder zumindest eine klar sichtbare Erklärung mit Link und konkreten Schritten.

- [ ] **Kein Profil-Vollständigkeits-Indikator** – Es gibt keine Prozentanzeige oder Checkliste die zeigt wie vollständig das Profil ist. User wissen nicht, was noch fehlt. Fix: Completion-Bar oder To-do-Liste im Profil-Editor (z. B. „5 von 8 Felder ausgefüllt").

---

## 🟡 Klein – Offen

- [ ] **Hamburger-Menü auf Desktop** – Button „Menü öffnen" ist auf Desktop-Breiten sichtbar neben der vollständigen Nav. Auf Desktop per CSS ausblenden.

- [ ] **Google Fonts Self-Hosting** – Plus Jakarta Sans wird aktuell von Google-Servern geladen, noch vor Cookie-Consent. Font lokal hosten (z. B. via next/font) um DSGVO-konform zu sein.

- [ ] **Aria-Label für Logo-Link** – Der Logo-Link href="/" hat keinen Linktext für Screen Reader. aria-label="BoundTime – Startseite" ergänzen.

- [ ] **Impressum & AGB in der Hauptnavigation** – Aktuell nur im Footer verlinkt. Für rechtliche Sichtbarkeit zumindest „Impressum" in die Header-Nav ergänzen.

- [ ] **Nick-Feld fehlt im Accessibility Tree** – Das Nick-Inputfeld (id="nick") taucht nicht als interaktives Element im Accessibility Tree auf. aria-label oder korrektes label for="nick" sicherstellen.

- [ ] **Keine visuelle Fortschrittsanzeige bei Registrierung** – Der Schritt-Counter ist nur Text („SCHRITT 1 VON 3"). Eine visuelle Step-Indicator-Leiste würde die UX deutlich verbessern.

- [ ] **Geburtsdatum: Widerspruch Darstellung vs. Input-Typ** – Placeholder zeigt tt.mm.jjjj (DE-Format), Input ist aber type="date" (ISO intern). Fix: konsistentes deutsches Format sicherstellen oder auf Text-Input mit Validierung wechseln.

- [ ] **Schreibfehler „Profil-Identitaet"** – Badge zeigt „Profil-Identitaet". Korrigieren zu „Profil-Identität".

- [ ] **Schreibfehler „Relevante Rueckmeldungen"** – Im INTERAKTION-Tab steht „Rueckmeldungen" statt „Rückmeldungen".

- [ ] **„GELIKED" als Anglizismus** – „WER HAT DEIN PROFIL GELIKED" klingt holprig. Besser: „WER HAT DEIN PROFIL GEMOCHT".

- [ ] **Label „Deine Angaben" zu generisch** – Das Textarea-Feld für Erwartungen ist mit „Deine Angaben" beschriftet – nichtssagend. Fix: umbenennen zu „Was erwartest du von deinem Partner?" und Placeholder anpassen.

---

## 📋 Noch zu prüfen

*(MyBound, Entdecken, Forum, Nachrichten, Keuschhaltung, Einstellungen noch nicht geprüft)*

---
---

## ✅ Erledigt

### 🔴 Kritisch

- [x] **Dropdowns Schritt 2 reagieren nicht auf Mausklick** – React onChange-Handler korrekt verdrahtet.

- [x] **Kein Redirect nach Login** – Nach Login wird nun auf das Dashboard weitergeleitet.

### 🟠 Mittel

- [x] **Falscher Link „Über BoundTime"** – Startseite linkt nun korrekt auf /ueber-uns.

- [x] **Cookie-Banner erscheint bei jeder Navigation** – localStorage-Check korrigiert.

- [x] **Schreibfehler „BoundTime- Features"** – Korrigiert zu BoundTime-Features.

- [x] **Redundante Quick-Links auf Startseite** – Von 5 auf 3 sinnvolle Links reduziert.

- [x] **Kein Standortfeld im Registrierungsprozess** – Hinweis/Redirect zur Profilkompletion ergänzt.

- [x] **Doppelter Hinweistext im Profil-Editor** – Einer der zwei identischen Sätze entfernt.