-- 1. Vorlieben (preferences) in profiles
alter table public.profiles
  add column if not exists preferences text[];

-- 2. Lock nur durch Dom: Trigger entfernen, der locked_at beim Statuswechsel setzt
drop trigger if exists chastity_arrangements_set_locked_at on public.chastity_arrangements;
drop function if exists public.chastity_set_locked_at();
