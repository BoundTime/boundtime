-- Profilbild aus Hauptalbum: photo_album_photos erweitern, profiles.avatar_photo_id

alter table public.photo_album_photos
  add column if not exists title text;
alter table public.photo_album_photos
  add column if not exists caption text;

alter table public.profiles
  add column if not exists avatar_photo_id uuid references public.photo_album_photos(id) on delete set null;

comment on column public.photo_album_photos.title is 'Optionaler Name des Fotos (z.B. Profilbild, Strand 2024)';
comment on column public.photo_album_photos.caption is 'Optionaler beschreibender Text zum Foto';
comment on column public.profiles.avatar_photo_id is 'Foto aus dem Hauptalbum, das als Profilbild dient';
