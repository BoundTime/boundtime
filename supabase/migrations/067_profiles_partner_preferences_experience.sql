-- Pro Partner: Vorlieben und Erfahrungslevel der zweiten Person (bei Paar)
alter table public.profiles
  add column if not exists partner_preferences text[],
  add column if not exists partner_experience_level text
    check (partner_experience_level is null or partner_experience_level in ('beginner', 'experienced', 'advanced'));

comment on column public.profiles.partner_preferences is 'Nur bei Paar: Vorlieben zweite Person';
comment on column public.profiles.partner_experience_level is 'Nur bei Paar: Erfahrungslevel zweite Person';
