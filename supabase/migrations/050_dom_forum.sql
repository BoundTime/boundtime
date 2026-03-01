-- Dom(me)-Forum: Themen und Beiträge für verifizierte Dom(me)s
create table public.dom_forum_topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 3 and char_length(title) <= 200),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.dom_forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.dom_forum_topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  image_url text,
  created_at timestamptz default now()
);

create index dom_forum_topics_updated_at on public.dom_forum_topics(updated_at desc);
create index dom_forum_posts_topic_id on public.dom_forum_posts(topic_id);
create index dom_forum_posts_created_at on public.dom_forum_posts(topic_id, created_at);

alter table public.dom_forum_topics enable row level security;
alter table public.dom_forum_posts enable row level security;

-- Nur verifizierte Dom/Switcher lesen und schreiben
create policy "dom_forum_topics_select" on public.dom_forum_topics
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.verified = true and p.role in ('Dom', 'Switcher')
    )
  );
create policy "dom_forum_topics_insert" on public.dom_forum_topics
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.verified = true and p.role in ('Dom', 'Switcher')
    )
  );
create policy "dom_forum_topics_update" on public.dom_forum_topics
  for update using (auth.uid() = author_id);
create policy "dom_forum_topics_delete" on public.dom_forum_topics
  for delete using (auth.uid() = author_id);

create policy "dom_forum_posts_select" on public.dom_forum_posts
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.verified = true and p.role in ('Dom', 'Switcher')
    )
  );
create policy "dom_forum_posts_insert" on public.dom_forum_posts
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.verified = true and p.role in ('Dom', 'Switcher')
    )
  );
create policy "dom_forum_posts_update" on public.dom_forum_posts
  for update using (auth.uid() = author_id);
create policy "dom_forum_posts_delete" on public.dom_forum_posts
  for delete using (auth.uid() = author_id);

-- Trigger: updated_at beim neuen Post im Thema
create or replace function public.dom_forum_topic_updated_at()
returns trigger language plpgsql as $$
begin
  update public.dom_forum_topics set updated_at = now() where id = new.topic_id;
  return new;
end;
$$;
create trigger tr_dom_forum_topic_updated
  after insert on public.dom_forum_posts
  for each row execute function public.dom_forum_topic_updated_at();
