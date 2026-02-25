-- 1. Ort: Stadt + PLZ (für Suche „in der Nähe“)
alter table public.profiles
  add column if not exists city text,
  add column if not exists postal_code text check (postal_code is null or (char_length(postal_code) = 5 and postal_code ~ '^\d{5}$'));

comment on column public.profiles.postal_code is 'Deutsche PLZ, 5 Ziffern';

-- 2. „Was suchst du?“: Mehrfachauswahl (vorgegebene Optionen)
alter table public.profiles
  add column if not exists looking_for text[];

-- Altes Einzelfeld entfernen (Daten gehen verloren – nur bei Bedarf migrieren)
alter table public.profiles drop column if exists looking_for_what;

-- 3. Aussehen-Feld entfernen, Erwartungen-Feld hinzufügen
alter table public.profiles drop column if exists appearance_text;
alter table public.profiles
  add column if not exists expectations_text text check (expectations_text is null or char_length(expectations_text) <= 500);

comment on column public.profiles.expectations_text is 'Was erwartest du von deinem Gesuchten? (Freitext, max. 500 Zeichen)';

-- 4. Storage-Policies für Avatars: Pfadprüfung mit Standard-SQL (kompatibel)
-- Alte Policies droppen, falls sie existieren (Namen wie in 002)
drop policy if exists "avatars_upload_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

-- Erster Pfadbestandteil = User-ID (Format: <user_id>/avatar.jpg)
create policy "avatars_upload_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and split_part(name, '/', 1) = auth.uid()::text);

create policy "avatars_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and split_part(name, '/', 1) = auth.uid()::text);

create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and split_part(name, '/', 1) = auth.uid()::text);
