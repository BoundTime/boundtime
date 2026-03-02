# Prompt: Postfach – Anhänge, wachsendes Eingabefeld, Nachricht bearbeiten

## 1. Anhänge in Nachrichten

**Anforderung:** Im Postfach (Chat) soll man Anhänge zu Nachrichten beifügen können.

**Umsetzung:**
- **Storage:** Neuer Bucket `message-attachments` (oder Pfad innerhalb eines bestehenden Buckets). RLS: Nur Beteiligte der Konversation dürfen lesen/schreiben.
- **Datenmodell:** Entweder
  - a) Neue Tabelle `message_attachments` (message_id, file_path, filename, mime_type, created_at) – mehrere Anhänge pro Nachricht
  - b) Oder: Spalte `attachments` (jsonb) in `messages` mit Array von {path, filename}
- **UI:** Im MessageInput: Datei-Upload-Button (Bild, evtl. PDF). Vor dem Senden Anhänge auswählbar, nach dem Senden in der Nachricht sichtbar (Vorschaubild oder Link zum Download).
- **ChatMessages:** Anhänge unter/neben dem Text anzeigen (Bilder als Thumbnail, andere Dateien als Download-Link).

---

## 2. Wachsendes Eingabefeld

**Anforderung:** Das Nachrichten-Eingabefeld soll sich vergrößern, wenn die Nachricht länger wird – damit man die gesamte Nachricht sieht, bevor man sie verschickt.

**Umsetzung:**
- **MessageInput:** Statt `<input type="text">` ein `<textarea>` verwenden.
- **Auto-Resize:** Die Höhe des textarea soll mit dem Inhalt wachsen (z.B. `rows={1}` bis `rows={5}` oder mehr, mit `max-height` begrenzen, z.B. 150–200px, danach scrollbar).
- Technik: `onInput`/`onChange` – `scrollHeight` auslesen und `height` setzen, oder CSS `field-sizing: content` (falls unterstützt), oder `rows` dynamisch anpassen.
- Das Layout soll erhalten bleiben: Senden-Button rechts neben dem Feld, evtl. unten ausgerichtet.

---

## 3. Verschickte Nachrichten bearbeiten

**Anforderung:** Es soll möglich sein, eine bereits verschickte Nachricht zu bearbeiten (z.B. Tippfehler korrigieren).

**Umsetzung:**
- **DB:** Spalte `edited_at` (timestamptz, nullable) in `messages`. Wenn gesetzt: Nachricht wurde bearbeitet.
- **RLS:** Policy `messages_update` für `sender_id = auth.uid()` – nur der Absender darf die eigene Nachricht bearbeiten.
- **UI:** Bei eigenen Nachrichten: „Bearbeiten“-Button (z.B. bei Hover oder Kontextmenü). Beim Klick: Inline-Bearbeitung oder Modal mit Textarea, Speichern-Abbruch. Nach dem Speichern: `content` und `edited_at` aktualisieren.
- **Anzeige:** Bei bearbeiteten Nachrichten „(bearbeitet)“ oder „(editiert)“ anzeigen (z.B. neben der Uhrzeit). Optional: Tooltip mit „Bearbeitet am [Datum]“.
- **Hinweis:** Nur der Text kann bearbeitet werden; Anhänge (falls vorhanden) bleiben unverändert. Optional: Spätere Erweiterung für Anhang-Entfernen.

---

## Kurz-Checkliste

- [ ] Storage: Bucket für Nachrichten-Anhänge + RLS
- [ ] Migration: message_attachments Tabelle ODER attachments-Spalte in messages
- [ ] MessageInput: Datei-Upload für Anhänge
- [ ] ChatMessages: Anhänge anzeigen (Bilder, Links)
- [ ] MessageInput: textarea mit Auto-Resize statt input
- [ ] Migration: messages.edited_at
- [ ] RLS: messages_update für Absender
- [ ] ChatMessages: Bearbeiten-Button bei eigenen Nachrichten
- [ ] Bearbeiten-UI (Inline oder Modal) + „(bearbeitet)“-Anzeige

---

**Nach Erledigung: Inhalt dieser Datei löschen.**
