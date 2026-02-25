-- Profilbesucher, Profil-Likes, Post-Likes (Instagram-Stil)

-- 1. profile_views: Wer hat wessen Profil besucht
create table if not exists public.profile_views (
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (viewer_id, profile_id),
  check (viewer_id != profile_id)
);

create index profile_views_profile_id on public.profile_views(profile_id);
create index profile_views_viewed_at on public.profile_views(profile_id, viewed_at desc);

alter table public.profile_views enable row level security;

-- Lesen: nur Profilinhaber (profile_id = auth.uid())
create policy "profile_views_select_owner" on public.profile_views
  for select using (auth.uid() = profile_id);

-- Insert/Update: jeder eingeloggte User kann View auf fremdes Profil eintragen (viewer_id = auth.uid())
create policy "profile_views_insert" on public.profile_views
  for insert with check (auth.uid() = viewer_id and viewer_id != profile_id);

create policy "profile_views_update" on public.profile_views
  for update using (auth.uid() = viewer_id);

-- 2. profile_likes: Wer hat wessen Profil geliked
create table if not exists public.profile_likes (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  liker_id uuid not null references public.profiles(id) on delete cascade,
  liked_at timestamptz not null default now(),
  primary key (profile_id, liker_id),
  check (profile_id != liker_id)
);

create index profile_likes_profile_id on public.profile_likes(profile_id);
create index profile_likes_liker_id on public.profile_likes(liker_id);

alter table public.profile_likes enable row level security;

-- Lesen: alle (für Anzeige auf Profilseite und für Profilinhaber)
create policy "profile_likes_select" on public.profile_likes for select using (true);

-- Insert/Delete: nur eigener liker_id
create policy "profile_likes_insert" on public.profile_likes
  for insert with check (auth.uid() = liker_id and profile_id != liker_id);

create policy "profile_likes_delete" on public.profile_likes
  for delete using (auth.uid() = liker_id);

-- 3. post_likes: Wer hat welchen Post geliked
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  liked_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index post_likes_post_id on public.post_likes(post_id);
create index post_likes_user_id on public.post_likes(user_id);

alter table public.post_likes enable row level security;

-- Lesen: alle (für Like-Anzahl und "wer hat geliked")
create policy "post_likes_select" on public.post_likes for select using (true);

-- Insert/Delete: nur eigener user_id
create policy "post_likes_insert" on public.post_likes
  for insert with check (auth.uid() = user_id);

create policy "post_likes_delete" on public.post_likes
  for delete using (auth.uid() = user_id);
