-- Variante A: Neue Nachrichten erscheinen nicht mehr in der Glocke.
-- Trigger entfernen – es werden keine Benachrichtigungen vom Typ new_message mehr erzeugt.
-- Der rote Badge am Link „Nachrichten“ (Ungelesen-Anzeige) bleibt unverändert.

drop trigger if exists tr_notify_new_message on public.messages;
