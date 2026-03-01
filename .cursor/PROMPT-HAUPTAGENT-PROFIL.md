# Prompt: Feedbacks umsetzen – 5 Punkte

## 1. Keuschhaltung: Sub nur eine Verbindung + Bug bei Bestätigung

### 1.1 Regel: Sub darf nur eine aktive Verbindung haben

**Aktuell:** ChastityRequestButton prüft nur, ob mit **diesem** Dom schon eine Verbindung existiert. ChastityStartForm prüft nur, ob **dieser** Dom mit **diesem** Sub schon eine Dynamik hat.

**Gefordert:**
- Ein Sub darf **nur eine** aktive Verbindung zu einem Dom haben (unabhängig davon, welcher Dom).
- Hat ein Sub bereits eine Verbindung (Status: `pending`, `active`, `paused`, `requested_by_sub`), dann:
  - **ChastityRequestButton** (Sub bittet um Keuschhaltung): Kein Button, stattdessen Text wie „Du bist schon in einer Verbindung mit einem Dom.“
  - **ChastityStartForm** (Dom bietet/startet Dynamik): Wenn der gewählte Sub schon eine Verbindung hat → Fehlermeldung „Dieser Sub gehört schon einem Dom.“ bzw. Hinweis anzeigen und Erstellung blockieren.
- Auf dem Profil eines Subs, der schon verbunden ist: Deutlicher Hinweis „Dieser Sub gehört bereits einem Dom.“ (z.B. bei Doms, die eine Dynamik anbieten wollen).

### 1.2 Prüflogik

- **Sub-Button:** Vor Anzeige des Buttons prüfen: Gibt es ein `chastity_arrangement` mit `sub_id = user.id` und `status IN ('pending','active','paused','requested_by_sub')`? Wenn ja → Text statt Button.
- **Dom-Form:** Vor dem Erstellen prüfen: Gibt es ein Arrangement mit `sub_id = subId` und `status IN (...)`? Wenn ja → Fehler, kein Insert.

### 1.3 Bug: Sub kann Verbindung nicht bestätigen

**Problem:** Nach Annahme durch den Dom (Belohnungsziel festgelegt, Status `pending`) soll der Sub bestätigen. Beim Klick auf „Annehmen“ passiert nichts.

**Zu prüfen:**
- ChastityAcceptDecline: Update von `status` auf `active` – RLS (Sub darf updaten?), fehlende Spalten, Fehlerbehandlung.
- Gibt es einen JavaScript-Fehler oder wird `router.refresh()` nicht ausgeführt?
- Sind `chastity_arrangements`-Policies korrekt? Sub muss mit `auth.uid() = sub_id` updaten können.
- Optional: Nach dem Update `router.refresh()` aufrufen; bei Fehler Fehlermeldung anzeigen statt stilles Scheitern.

---

## 2. Postfach: Profilbild klickbar → Profil des Gegenübers anzeigen

**Aktuell:** In der Chat-Ansicht (Nachrichten) ist das Profilbild des Gegenübers im Header sichtbar, aber nicht klickbar.

**Gefordert:** Beim Klick auf das Profilbild des Chat-Partners soll dessen Profil geöffnet werden (`/dashboard/entdecken/{otherId}`).

**Umsetzung:** In `app/(app)/dashboard/nachrichten/[id]/page.tsx` den Avatar-Bereich im Header mit einem `Link` zu `/dashboard/entdecken/${otherId}` umschließen (oder den Avatar als Link gestalten).

---

## 3. Rote Punkte / Nachrichten-Anzahl aktualisieren sich nicht beim Lesen

**Problem:** Wenn der Nutzer eine Nachricht liest, verschwindet der rote Punkt bzw. die Nachrichtenanzahl nicht. Erst nach Browser-Aktualisierung wird es korrekt.

**Ursache:** `useUnreadMessageCount` nutzt zwar Supabase Realtime auf `messages` – möglicherweise ist für `UPDATE` keine Replikation aktiv, oder das Event kommt nicht an.

**Umsetzung:**
- Prüfen, ob die Tabelle `messages` in der Supabase-Realtime-Publikation enthalten ist und `UPDATE`-Events ausgeliefert werden.
- **Alternative:** Wenn Realtime nicht greift: Nach dem Setzen von `read_at` in ChatMessages ein benutzerdefiniertes Event auslösen (z.B. `window.dispatchEvent(new CustomEvent('messages-read'))`), auf das `useUnreadMessageCount` hört und die Anzahl neu lädt.
- Oder: Beim Verlassen der Chat-Seite bzw. beim Fokussieren des Fensters die Anzahl neu laden (z.B. `visibilitychange` oder `focus`).

---

## 4. Glocke: Bei Post-Like-Benachrichtigung „wer was“ anzeigen

**Problem:** Bei „Post geliked“ sieht man in der Glocke nicht, wer welchen Post geliked hat.

**Gefordert:** Beim Klick auf die Benachrichtigung soll klar werden, wer welchen Post geliked hat.

**Hinweise:**
- Die Benachrichtigung hat `related_user_id` (Liker) und `related_id` (post_id).
- NotificationBell zeigt aktuell nur generische Labels (z.B. „Like auf deinen Post“).
- **Umsetzung:** In der Glocken-Dropdown-Liste für `post_like` den Nick des Likers anzeigen, z.B. „Max hat deinen Post geliked“. Dafür `related_user_id` auflösen (Nick aus `profiles`) – entweder per Join in der Abfrage oder gesonderter Lookup.
- Der Link führt bereits zu `/dashboard/aktivitaet/post-likes`, wo Detailansicht mit Post und Liker existiert. Zusätzlich könnte für `post_like` ein direkter Link zum spezifischen Post sinnvoll sein (z.B. `/dashboard/aktivitaet/post-likes#post-{related_id}` oder Scroll zum Post), falls technisch möglich.

---

## 5. Keuschhaltung-Tab: Roter Punkt + Benachrichtigung bei Sub-Anfrage

### 5.1 Roter Punkt am Keuschhaltung-Tab

**Gefordert:** Wenn eine Anfrage wartet oder es Neues bei einer Verbindung gibt, soll am Keuschhaltung-Tab (Reiter/Link in der Nav) ein roter Punkt erscheinen.

**Aktuell:** ChastityNavBadge zählt nur `chastity_reward_requests` (pending) und `chastity_random_checks` (pending).

**Erweiterung:** Zusätzlich berücksichtigen:
- **Als Dom:** Arrangements mit `status = 'requested_by_sub'` (Sub hat um Keuschhaltung gebeten).
- **Als Sub:** Arrangements mit `status = 'pending'` (Dom hat angeboten, Sub soll bestätigen).
- Optional: Weitere relevante offene Punkte (z.B. Aufgaben, Checks).

ChastityNavBadge-Logik entsprechend anpassen; roter Punkt anzeigen, wenn mindestens einer dieser Fälle zutrifft.

### 5.2 Benachrichtigung bei Sub-Anfrage

**Gefordert:** Wenn ein Keuschling (Sub) eine Anfrage schickt, soll der Dom eine Benachrichtigung in der Glocke erhalten.

**Aktuell:** `chastity_arrangement_offer` benachrichtigt den **Sub**, wenn der **Dom** eine Anfrage erstellt/anbietet. Es fehlt die umgekehrte Richtung: Dom wird benachrichtigt, wenn der Sub eine Anfrage stellt (`status = 'requested_by_sub'`).

**Umsetzung:**
- Neuen Notification-Typ einführen, z.B. `chastity_sub_request` (oder bestehenden Typ erweitern).
- Trigger: Beim INSERT in `chastity_arrangements` mit `status = 'requested_by_sub'` den Dom (`dom_id`) benachrichtigen.
- In `NOTIFICATION_LABELS` und `getNotificationHref` den neuen Typ erfassen.
- Glocken-Link z.B. auf `/dashboard/keuschhaltung` setzen.

---

## Reihenfolge (Empfehlung)

1. Punkt 2 (Profilbild-Link) – schnell umsetzbar
2. Punkt 1 (Sub-Regel + Bestätigungs-Bug) – zentral für die Keuschhaltungs-Logik
3. Punkt 5 (Roter Punkt + Sub-Benachrichtigung)
4. Punkt 4 (Post-Like-Details in der Glocke)
5. Punkt 3 (Echtzeit-Update der Nachrichtenanzahl)

---

## Offene Fragen

- Zu 1.3: Ist der Fehler reproduzierbar? Tritt er bei allen Subs oder nur unter bestimmten Bedingungen auf?
- Zu 4: Soll die Post-Like-Benachrichtigung direkt zum konkreten Post springen (z.B. mit Anker), oder reicht die Post-Likes-Seite mit Übersicht?
- Zu 5: Soll der rote Punkt am Keuschhaltung-Tab eine **Zahl** anzeigen (wie bei Nachrichten) oder nur als Indikator (Punkt ohne Zahl)?

---

**Nach Erledigung: Inhalt dieser Datei löschen.**
