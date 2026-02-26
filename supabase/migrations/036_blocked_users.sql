-- Block-Funktion: Nutzer können andere blockieren

create table public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id != blocked_id)
);

create index blocked_users_blocker_id on public.blocked_users(blocker_id);
create index blocked_users_blocked_id on public.blocked_users(blocked_id);

alter table public.blocked_users enable row level security;

create policy "blocked_users_select_own" on public.blocked_users
  for select using (blocker_id = auth.uid());

create policy "blocked_users_insert_own" on public.blocked_users
  for insert with check (blocker_id = auth.uid());

create policy "blocked_users_delete_own" on public.blocked_users
  for delete using (blocker_id = auth.uid());
