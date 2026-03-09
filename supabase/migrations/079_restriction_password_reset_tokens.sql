-- Token für Cuckymode-Passwort-Reset (Link in E-Mail, einmalige Nutzung, Ablauf z. B. 1 Stunde)

create table if not exists public.restriction_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_restriction_reset_tokens_token on public.restriction_password_reset_tokens(token);
create index idx_restriction_reset_tokens_expires on public.restriction_password_reset_tokens(expires_at);

alter table public.restriction_password_reset_tokens enable row level security;
create policy "Users can insert own reset tokens" on public.restriction_password_reset_tokens
  for insert to authenticated with check (auth.uid() = user_id);

comment on table public.restriction_password_reset_tokens is 'Einmalige Tokens für Cuckymode-Passwort-Reset per Link';

-- RPC: Token einlösen – Hash löschen, Token entfernen. Einmalige Nutzung.
create or replace function public.consume_restriction_reset_token(p_token text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
  v_row record;
begin
  if p_token is null or trim(p_token) = '' then
    raise exception 'Ungültiger Token';
  end if;
  select user_id, expires_at into v_row
  from public.restriction_password_reset_tokens
  where token = trim(p_token);
  if not found then
    raise exception 'Token ungültig oder bereits verwendet';
  end if;
  if v_row.expires_at < now() then
    delete from public.restriction_password_reset_tokens where token = trim(p_token);
    raise exception 'Token abgelaufen';
  end if;
  v_user_id := v_row.user_id;
  update public.profiles set restriction_password_hash = null where id = v_user_id;
  delete from public.restriction_password_reset_tokens where token = trim(p_token);
end;
$$;

grant execute on function public.consume_restriction_reset_token(text) to anon;
grant execute on function public.consume_restriction_reset_token(text) to authenticated;
