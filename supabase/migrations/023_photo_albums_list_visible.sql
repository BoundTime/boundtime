-- Album-Metadaten (Name, id) für alle sichtbar, damit Nutzer Anfragen senden können
-- Die Fotos bleiben durch photo_album_photos RLS geschützt

drop policy if exists "photo_albums_select" on public.photo_albums;

create policy "photo_albums_select" on public.photo_albums
  for select using (true);
