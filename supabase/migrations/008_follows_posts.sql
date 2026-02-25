-- Folgen-Modell und Posts (Instagram-Teil)

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  image_url text,
  created_at timestamptz default now()
);

create index follows_follower_id on public.follows(follower_id);
create index follows_following_id on public.follows(following_id);
create index posts_author_id on public.posts(author_id);
create index posts_created_at on public.posts(created_at desc);

alter table public.follows enable row level security;
alter table public.posts enable row level security;

-- follows: öffentlich lesbar, insert/delete nur für eigenen follower_id
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);

-- posts: öffentlich lesbar, insert nur als author, update/delete nur für eigenen Post
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = author_id);

-- Storage Bucket post-images (öffentlich lesbar, Upload für authenticated)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post_images_upload" on storage.objects
  for insert with check (
    bucket_id = 'post-images' and auth.role() = 'authenticated'
  );
create policy "post_images_read" on storage.objects
  for select using (bucket_id = 'post-images');
create policy "post_images_delete" on storage.objects
  for delete using (bucket_id = 'post-images' and auth.role() = 'authenticated');
