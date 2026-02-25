-- Tabelle für Nutzer-Profile (Nick ist öffentlich, E-Mail bleibt in auth.users und wird nie angezeigt)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nick text not null,
  created_at timestamptz default now()
);

-- Nick eindeutig (case-insensitive: "Nick" und "nick" gelten als gleich)
create unique index profiles_nick_lower_unique on public.profiles (lower(nick));

-- Mindestlänge und Zeichen: nur Buchstaben, Zahlen, Unterstrich (optional, wird auch im Frontend geprüft)
alter table public.profiles add constraint profiles_nick_length check (char_length(nick) >= 2 and char_length(nick) <= 30);

alter table public.profiles enable row level security;

-- Nicks dürfen gelesen werden (für Eindeutigkeitsprüfung und Anzeige)
create policy "profiles_select" on public.profiles for select using (true);

-- Nur eigenes Profil nach Registrierung anlegen
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Nur eigenes Profil später bearbeiten
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Funktion: Ist dieser Nick schon vergeben? (case-insensitive)
create or replace function public.nick_exists(check_nick text) returns boolean
language sql security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where lower(nick) = lower(check_nick));
$$;

-- Anon darf die Funktion aufrufen (für Registrierungs-Check)
grant execute on function public.nick_exists(text) to anon;
grant execute on function public.nick_exists(text) to authenticated;
