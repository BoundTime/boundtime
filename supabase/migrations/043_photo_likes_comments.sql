-- Foto-Likes und Foto-Kommentare

create table public.photo_album_photo_likes (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photo_album_photos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(photo_id, user_id)
);
create index photo_album_photo_likes_photo on public.photo_album_photo_likes(photo_id);
create index photo_album_photo_likes_user on public.photo_album_photo_likes(user_id);

alter table public.photo_album_photo_likes enable row level security;

-- SELECT: Wer das Album sehen darf (gleiche Logik wie photo_album_photos)
create policy "photo_album_photo_likes_select" on public.photo_album_photo_likes
  for select using (
    exists (
      select 1 from public.photo_album_photos p
      join public.photo_albums a on a.id = p.album_id
      where p.id = photo_id
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
create policy "photo_album_photo_likes_insert" on public.photo_album_photo_likes
  for insert with check (user_id = auth.uid());
create policy "photo_album_photo_likes_delete" on public.photo_album_photo_likes
  for delete using (user_id = auth.uid());

-- Foto-Kommentare
create table public.photo_album_photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photo_album_photos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 500),
  created_at timestamptz default now()
);
create index photo_album_photo_comments_photo on public.photo_album_photo_comments(photo_id);

alter table public.photo_album_photo_comments enable row level security;

create policy "photo_album_photo_comments_select" on public.photo_album_photo_comments
  for select using (
    exists (
      select 1 from public.photo_album_photos p
      join public.photo_albums a on a.id = p.album_id
      where p.id = photo_id
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
create policy "photo_album_photo_comments_insert" on public.photo_album_photo_comments
  for insert with check (user_id = auth.uid());
create policy "photo_album_photo_comments_delete_own" on public.photo_album_photo_comments
  for delete using (user_id = auth.uid());
create policy "photo_album_photo_comments_delete_owner" on public.photo_album_photo_comments
  for delete using (
    exists (
      select 1 from public.photo_album_photos p
      join public.photo_albums a on a.id = p.album_id
      where p.id = photo_id and a.owner_id = auth.uid()
    )
  );
