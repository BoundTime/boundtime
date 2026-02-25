-- Fotoalben: Hauptalbum für alle sichtbar, restliche nur nach Anfrage

create table if not exists public.photo_albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 1 and char_length(name) <= 100),
  is_main boolean not null default false,
  created_at timestamptz default now()
);

-- Pro User maximal ein Hauptalbum
create unique index photo_albums_main_per_user on public.photo_albums (owner_id)
  where is_main = true;

alter table public.photo_albums enable row level security;

create table if not exists public.album_view_requests (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.photo_albums(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  responded_at timestamptz,
  unique(album_id, requester_id)
);

create policy "photo_albums_select" on public.photo_albums
  for select using (
    is_main = true
    or owner_id = auth.uid()
    or exists (
      select 1 from public.album_view_requests r
      where r.album_id = id and r.requester_id = auth.uid() and r.status = 'approved'
    )
  );
create policy "photo_albums_insert" on public.photo_albums
  for insert with check (owner_id = auth.uid());
create policy "photo_albums_update" on public.photo_albums
  for update using (owner_id = auth.uid());
create policy "photo_albums_delete" on public.photo_albums
  for delete using (owner_id = auth.uid());

create table if not exists public.photo_album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.photo_albums(id) on delete cascade,
  storage_path text not null,
  fsk18 boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

alter table public.photo_album_photos enable row level security;

create policy "photo_album_photos_select" on public.photo_album_photos
  for select using (
    exists (
      select 1 from public.photo_albums a
      where a.id = album_id
      and (
        a.is_main = true
        or a.owner_id = auth.uid()
        or exists (
          select 1 from public.album_view_requests r
          where r.album_id = a.id and r.requester_id = auth.uid() and r.status = 'approved'
        )
      )
    )
  );
create policy "photo_album_photos_insert" on public.photo_album_photos
  for insert with check (
    exists (select 1 from public.photo_albums a where a.id = album_id and a.owner_id = auth.uid())
  );
create policy "photo_album_photos_update" on public.photo_album_photos
  for update using (
    exists (select 1 from public.photo_albums a where a.id = album_id and a.owner_id = auth.uid())
  );
create policy "photo_album_photos_delete" on public.photo_album_photos
  for delete using (
    exists (select 1 from public.photo_albums a where a.id = album_id and a.owner_id = auth.uid())
  );

alter table public.album_view_requests enable row level security;

create policy "album_view_requests_select" on public.album_view_requests
  for select using (
    requester_id = auth.uid()
    or exists (select 1 from public.photo_albums a where a.id = album_id and a.owner_id = auth.uid())
  );
create policy "album_view_requests_insert" on public.album_view_requests
  for insert with check (requester_id = auth.uid());
create policy "album_view_requests_update" on public.album_view_requests
  for update using (
    exists (select 1 from public.photo_albums a where a.id = album_id and a.owner_id = auth.uid())
  );

create index photo_albums_owner on public.photo_albums(owner_id);
create index photo_album_photos_album on public.photo_album_photos(album_id);
create index album_view_requests_album on public.album_view_requests(album_id);
create index album_view_requests_requester on public.album_view_requests(requester_id);

-- Storage-Bucket für Album-Fotos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'album-photos',
  'album-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Upload: nur in eigenen Ordner (owner_id/album_id/...)
create policy "album_photos_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'album-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "album_photos_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'album-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "album_photos_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'album-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Öffentlicher Lesezugriff (FSK18-Filter erfolgt in der App)
create policy "album_photos_public_read"
on storage.objects for select to public
using (bucket_id = 'album-photos');
