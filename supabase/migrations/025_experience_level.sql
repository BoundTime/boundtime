-- Erfahrungslevel im Profil (optional)
alter table public.profiles
  add column if not exists experience_level text
  check (experience_level is null or experience_level in ('beginner', 'experienced', 'advanced'));

comment on column public.profiles.experience_level is 'Optional: Einsteiger (beginner), erfahren (experienced), sehr erfahren (advanced)';
