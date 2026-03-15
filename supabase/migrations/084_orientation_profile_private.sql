-- Neigung (Orientierung) und Sichtbarkeit „gesperrt“ (nur Profilbild + Ort + Alter + Nachricht)

alter table public.profiles
  add column if not exists orientation text
    check (orientation is null or orientation in ('hetero', 'bi', 'lesbisch', 'schwul', 'pan', 'divers', 'frage_mich')),
  add column if not exists profile_private boolean not null default false;

comment on column public.profiles.orientation is 'Neigung/Orientierung: hetero, bi, lesbisch, schwul, pan, divers, frage_mich';
comment on column public.profiles.profile_private is 'Wenn true: Profil „gesperrt“ – für andere nur Profilbild, Ort, Alter und Nachricht senden sichtbar; Rest erst nach Verbunden';
