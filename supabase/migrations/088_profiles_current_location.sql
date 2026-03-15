-- Zweitort / aktueller Aufenthaltsort (optional)

alter table public.profiles
  add column if not exists current_postal_code text check (current_postal_code is null or (char_length(current_postal_code) = 5 and current_postal_code ~ '^\d{5}$')),
  add column if not exists current_city text;

comment on column public.profiles.current_postal_code is 'PLZ des aktuellen Aufenthaltsorts (Zweitort), optional';
comment on column public.profiles.current_city is 'Ort des aktuellen Aufenthaltsorts (Zweitort), optional';
