-- Stufenmodell Verifizierung: Bronze / Silber / Gold
-- verified bleibt; verification_tier ist die Anzeige-Stufe

alter table public.profiles add column if not exists verification_tier text
  check (verification_tier in ('bronze', 'silver', 'gold')) default 'bronze';

comment on column public.profiles.verification_tier is 'Anzeige-Stufe: bronze (Basis), silver (Profil ≥80%), gold (ID-verifiziert)';

-- Backfill: verified = true → gold, Rest → bronze (Silber wird bei Profil-Speicherung gesetzt)
update public.profiles set verification_tier = case when verified then 'gold' else 'bronze' end;
