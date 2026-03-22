-- Allgemeines Forum: alle authentifizierten Nutzer lesen/schreiben (ohne Dom-Rolle)
create table public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 3 and char_length(title) <= 200),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  image_url text,
  created_at timestamptz default now()
);

create index forum_topics_updated_at on public.forum_topics(updated_at desc);
create index forum_posts_topic_id on public.forum_posts(topic_id);
create index forum_posts_created_at on public.forum_posts(topic_id, created_at);

alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;

create policy "forum_topics_select" on public.forum_topics
  for select to authenticated using (true);

create policy "forum_topics_insert" on public.forum_topics
  for insert to authenticated with check (auth.uid() = author_id);

create policy "forum_topics_update" on public.forum_topics
  for update to authenticated using (auth.uid() = author_id);

create policy "forum_topics_delete" on public.forum_topics
  for delete to authenticated using (auth.uid() = author_id);

create policy "forum_posts_select" on public.forum_posts
  for select to authenticated using (true);

create policy "forum_posts_insert" on public.forum_posts
  for insert to authenticated with check (auth.uid() = author_id);

create policy "forum_posts_update" on public.forum_posts
  for update to authenticated using (auth.uid() = author_id);

create policy "forum_posts_delete" on public.forum_posts
  for delete to authenticated using (auth.uid() = author_id);

create or replace function public.forum_topic_updated_at()
returns trigger language plpgsql as $$
begin
  update public.forum_topics set updated_at = now() where id = new.topic_id;
  return new;
end;
$$;

create trigger tr_forum_topic_updated
  after insert on public.forum_posts
  for each row execute function public.forum_topic_updated_at();
