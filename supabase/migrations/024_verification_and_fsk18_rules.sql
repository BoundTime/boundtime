-- verified in profiles, Verifizierungen-Tabelle, FSK18-Regeln

alter table public.profiles add column if not exists verified boolean not null default false;
alter table public.profiles add column if not exists is_admin boolean not null default false;

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_path text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  note text,
  unique(user_id)
);

alter table public.verifications enable row level security;

create policy "verifications_select_own" on public.verifications
  for select using (user_id = auth.uid());
create policy "verifications_select_admin" on public.verifications
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );
create policy "verifications_insert_own" on public.verifications
  for insert with check (user_id = auth.uid());

create policy "verifications_update_admin" on public.verifications
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );
-- User darf eigenes Pending-Update (Ersatzfoto) einreichen
create policy "verifications_update_own_pending" on public.verifications
  for update using (
    user_id = auth.uid() and status = 'pending'
  )
  with check (user_id = auth.uid());
comment on table public.verifications is 'Team prüft manuell; Admin setzt status. Benachrichtigung: Admin-Panel prüfen oder E-Mail-Integration.';

-- Storage-Bucket für Verifizierungsfotos (Foto mit Ausweis)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verifications',
  'verifications',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "verifications_storage_upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "verifications_storage_read_admin"
on storage.objects for select to authenticated
using (bucket_id = 'verifications' and (
  (storage.foldername(name))[1] = auth.uid()::text
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
));

-- FSK18 nicht im Hauptalbum erlauben
create or replace function public.prevent_fsk18_in_main_album()
returns trigger language plpgsql as $$
begin
  if new.fsk18 and exists (
    select 1 from public.photo_albums a where a.id = new.album_id and a.is_main
  ) then
    raise exception 'FSK18-Bilder dürfen nicht im Hauptalbum gespeichert werden.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_fsk18_main on public.photo_album_photos;
create trigger prevent_fsk18_main
  before insert or update on public.photo_album_photos
  for each row execute function public.prevent_fsk18_in_main_album();

-- Album-Anfragen nur für verifizierte User
drop policy if exists "album_view_requests_insert" on public.album_view_requests;
create policy "album_view_requests_insert" on public.album_view_requests
  for insert with check (
    requester_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.verified = true)
  );
