-- Einmal ausführen: Restriction-Passwort für Account explorers2024 löschen (Neustart)
-- Im Supabase Dashboard: SQL Editor → New query → Inhalt einfügen → Run

update public.profiles
set
  restriction_enabled = false,
  restriction_password_hash = null,
  restriction_recovery_email = null
where nick = 'explorers2024';

-- Prüfen, ob eine Zeile betroffen war (optional):
-- select id, nick, restriction_enabled, restriction_password_hash
-- from public.profiles where nick = 'explorers2024';
