-- Paarprofil: eigenes Profilbild pro Partner (Frau/Mann) zusätzlich zum gemeinsamen Paarprofilbild

alter table public.profiles
  add column if not exists couple_female_avatar_photo_id uuid references public.photo_album_photos(id) on delete set null,
  add column if not exists couple_male_avatar_photo_id uuid references public.photo_album_photos(id) on delete set null;

comment on column public.profiles.couple_female_avatar_photo_id is 'Foto aus Hauptalbum als Profilbild für die Frau (Paarprofil man_woman)';
comment on column public.profiles.couple_male_avatar_photo_id is 'Foto aus Hauptalbum als Profilbild für den Mann (Paarprofil man_woman)';

-- RPC: Setzt das Profilbild für Frau oder Mann (nur eigenes Paarprofil, Foto muss im Hauptalbum sein)
create or replace function public.set_couple_partner_avatar(p_which text, p_photo_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_main_album_id uuid;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  if p_which is null or lower(trim(p_which)) not in ('female', 'male') then
    raise exception 'Ungültiger Parameter: p_which muss ''female'' oder ''male'' sein';
  end if;

  -- Nur für Paarprofile
  if not exists (select 1 from public.profiles where id = v_user_id and account_type = 'couple') then
    raise exception 'Nur für Paarprofile';
  end if;

  select id into v_main_album_id
  from public.photo_albums
  where owner_id = v_user_id and is_main = true;

  if v_main_album_id is null then
    raise exception 'Kein Hauptalbum gefunden';
  end if;

  if p_photo_id is not null then
    if not exists (
      select 1 from public.photo_album_photos
      where id = p_photo_id and album_id = v_main_album_id
    ) then
      raise exception 'Foto gehört nicht zum Hauptalbum';
    end if;
  end if;

  if lower(trim(p_which)) = 'female' then
    update public.profiles
    set couple_female_avatar_photo_id = p_photo_id
    where id = v_user_id;
  else
    update public.profiles
    set couple_male_avatar_photo_id = p_photo_id
    where id = v_user_id;
  end if;
end;
$$;

grant execute on function public.set_couple_partner_avatar(text, uuid) to authenticated;
