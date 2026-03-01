-- Paar-Account mit Zugriffsbeschränkung
-- account_type: 'single' | 'couple'
-- restriction_*: nur für Paare, Hotwife kann Schreibzugriff per Passwort einschränken

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists account_type text
  check (account_type in ('single', 'couple')) default 'single';
alter table public.profiles add column if not exists restriction_enabled boolean not null default false;
alter table public.profiles add column if not exists restriction_password_hash text;
alter table public.profiles add column if not exists restriction_recovery_email text;

comment on column public.profiles.account_type is 'single = Einzelprofil, couple = Paar-Profil (Zugriffsbeschränkung möglich)';
comment on column public.profiles.restriction_enabled is 'Eingeschränkter Modus aktiv – Schreiben nur nach Passwort-Eingabe';
comment on column public.profiles.restriction_password_hash is 'bcrypt-Hash des Restriction-Passworts';
comment on column public.profiles.restriction_recovery_email is 'Optional: E-Mail für Reset des Restriction-Passworts';

-- RPC: Restriction-Passwort prüfen – gibt true zurück wenn korrekt
create or replace function public.check_restriction_password(p_user_id uuid, p_password text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_hash text;
begin
  if p_user_id is null or p_password is null or trim(p_password) = '' then
    return false;
  end if;
  select restriction_password_hash into v_hash
  from public.profiles where id = p_user_id and restriction_enabled = true;
  if v_hash is null then
    return false;
  end if;
  return v_hash = crypt(p_password, v_hash);
end;
$$;

-- RPC: Restriction-Passwort setzen/ändern
-- p_current_password: erforderlich wenn restriction bereits aktiv (zum Bestätigen)
create or replace function public.set_restriction_password(
  p_password text,
  p_recovery_email text default null,
  p_enabled boolean default false,
  p_current_password text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_current_enabled boolean;
  v_ok boolean;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  select restriction_enabled into v_current_enabled from public.profiles where id = v_user_id;
  if v_current_enabled then
    if p_current_password is null or trim(p_current_password) = '' then
      raise exception 'Aktuelles Passwort erforderlich um Einstellungen zu ändern';
    end if;
    select check_restriction_password(v_user_id, p_current_password) into v_ok;
    if not v_ok then
      raise exception 'Aktuelles Passwort ist falsch';
    end if;
  end if;
  update public.profiles set
    restriction_password_hash = case when trim(coalesce(p_password, '')) <> '' then crypt(p_password, gen_salt('bf')) else restriction_password_hash end,
    restriction_recovery_email = case when p_recovery_email is not null then nullif(trim(p_recovery_email), '') else restriction_recovery_email end,
    restriction_enabled = p_enabled
  where id = v_user_id;
end;
$$;

-- RPC: Prüfen ob User Schreiben darf (Restriction aktiv UND kein Unlock)
-- Wird vom Client aufgerufen – Server prüft bei Schreib-OPs separat
create or replace function public.is_restriction_blocking_write(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.profiles
    where id = p_user_id and account_type = 'couple' and restriction_enabled = true
  );
end;
$$;

grant execute on function public.check_restriction_password(uuid, text) to authenticated;
grant execute on function public.set_restriction_password(text, text, boolean, text) to authenticated;
grant execute on function public.is_restriction_blocking_write(uuid) to authenticated;

-- Trigger: account_type aus user_metadata beim Registrieren
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nick, gender, role, date_of_birth, account_type)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nick'), ''), 'user_' || left(new.id::text, 8)),
    coalesce(new.raw_user_meta_data->>'gender', 'Divers'),
    coalesce(new.raw_user_meta_data->>'role', 'Switcher'),
    case
      when new.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
      then (new.raw_user_meta_data->>'date_of_birth')::date
      else null
    end,
    case when new.raw_user_meta_data->>'account_type' = 'couple' then 'couple' else 'single' end
  );
  return new;
end;
$$;
