-- Cuckymode: granulare Einschränkungen (Hotwife wählt, was der Cucky nicht darf)

alter table public.profiles
  add column if not exists restriction_no_single_female_profiles boolean not null default false,
  add column if not exists restriction_no_messages boolean not null default false,
  add column if not exists restriction_no_couple_profiles boolean not null default false,
  add column if not exists restriction_no_images boolean not null default false;

comment on column public.profiles.restriction_no_single_female_profiles is 'Cuckymode: Cucky darf keine Single-Frauen-Profile sehen';
comment on column public.profiles.restriction_no_messages is 'Cuckymode: Cucky darf keine Nachrichten lesen oder schreiben';
comment on column public.profiles.restriction_no_couple_profiles is 'Cuckymode: Cucky darf keine Paar-Profile sehen';
comment on column public.profiles.restriction_no_images is 'Cuckymode: Cucky darf keine Bilder ansehen';

-- RPC: Nur die vier Restriction-Flags setzen (aktuelles Passwort nötig wenn Cuckymode aktiv)
create or replace function public.set_restriction_flags(
  p_no_single_female_profiles boolean default null,
  p_no_messages boolean default null,
  p_no_couple_profiles boolean default null,
  p_no_images boolean default null,
  p_current_password text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_enabled boolean;
  v_has_hash boolean;
  v_ok boolean;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  select restriction_enabled,
         (restriction_password_hash is not null and trim(restriction_password_hash) <> '')
  into v_enabled, v_has_hash
  from public.profiles where id = v_user_id;

  if v_enabled and v_has_hash then
    if p_current_password is null or trim(p_current_password) = '' then
      raise exception 'Aktuelles Passwort erforderlich um Einstellungen zu ändern';
    end if;
    select check_restriction_password(v_user_id, p_current_password) into v_ok;
    if not v_ok then
      raise exception 'Aktuelles Passwort ist falsch';
    end if;
  end if;

  update public.profiles set
    restriction_no_single_female_profiles = coalesce(p_no_single_female_profiles, restriction_no_single_female_profiles),
    restriction_no_messages = coalesce(p_no_messages, restriction_no_messages),
    restriction_no_couple_profiles = coalesce(p_no_couple_profiles, restriction_no_couple_profiles),
    restriction_no_images = coalesce(p_no_images, restriction_no_images)
  where id = v_user_id;
end;
$$;

grant execute on function public.set_restriction_flags(boolean, boolean, boolean, boolean, text) to authenticated;
