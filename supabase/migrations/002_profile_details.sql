-- Pflichtfelder bei Registrierung (bestehende Einträge bleiben gültig, neue müssen gesetzt werden)
alter table public.profiles
  add column if not exists gender text check (gender in ('Mann', 'Frau', 'Divers')),
  add column if not exists role text check (role in ('Dom', 'Sub', 'Switcher'));

-- Optionale Profilfelder (alle nullable)
alter table public.profiles
  add column if not exists height_cm int check (height_cm is null or (height_cm >= 100 and height_cm <= 250)),
  add column if not exists weight_kg int check (weight_kg is null or (weight_kg >= 30 and weight_kg <= 300)),
  add column if not exists body_type text check (body_type is null or body_type in ('schlank', 'sportlich', 'kräftig', 'mollig', 'keine Angabe')),
  add column if not exists date_of_birth date,
  add column if not exists age_range text check (age_range is null or age_range in ('18-25', '26-35', '36-45', '46+')),
  add column if not exists location text,
  add column if not exists looking_for_gender text,
  add column if not exists looking_for_what text,
  add column if not exists appearance_text text check (appearance_text is null or char_length(appearance_text) <= 500),
  add column if not exists about_me text check (about_me is null or char_length(about_me) <= 500),
  add column if not exists avatar_url text;

-- Geburtsdatum ODER Altersbereich (nicht beides sinnvoll ausgefüllt – nur App-Logik)
comment on column public.profiles.date_of_birth is 'Optional. Wenn gesetzt, kann Altersbereich abgeleitet werden.';
comment on column public.profiles.avatar_url is 'Pfad/URL zum Bild in Storage (z.B. avatars/<user_id>/avatar.jpg)';

-- Storage-Bucket für Profilbilder (öffentlich lesbar, nur eigenes Upload)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Nur eigenes Profilbild hochladen: Pfad muss avatars/<auth.uid()>/... sein
create policy "avatars_upload_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Nur eigenes Profilbild überschreiben/löschen
create policy "avatars_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Öffentlicher Lesezugriff auf avatars (für Anzeige in Profilen)
create policy "avatars_public_read"
on storage.objects for select to public
using (bucket_id = 'avatars');
