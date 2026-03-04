-- Nur ein Nickname pro Profil (Paar oder Single). partner_nick entfernen.
alter table public.profiles drop column if exists partner_nick;

-- Trigger ohne partner_nick: nur partner_date_of_birth bei Paar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_type text := case when new.raw_user_meta_data->>'account_type' = 'couple' then 'couple' else 'single' end;
  v_couple_type text := null;
  v_gender text;
  v_role text;
  v_partner_dob date := null;
begin
  if v_account_type = 'couple' then
    v_couple_type := new.raw_user_meta_data->>'couple_type';
    if v_couple_type not in ('man_woman', 'man_man', 'woman_woman') then
      v_couple_type := 'man_woman';
    end if;
    v_gender := 'Divers';
    v_role := 'Switcher';
    if new.raw_user_meta_data->>'partner_date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$' then
      v_partner_dob := (new.raw_user_meta_data->>'partner_date_of_birth')::date;
    end if;
  else
    v_gender := coalesce(new.raw_user_meta_data->>'gender', 'Divers');
    v_role := coalesce(new.raw_user_meta_data->>'role', 'Switcher');
  end if;

  insert into public.profiles (id, nick, gender, role, date_of_birth, account_type, couple_type, partner_date_of_birth)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nick'), ''), 'user_' || left(new.id::text, 8)),
    v_gender,
    v_role,
    case
      when new.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
      then (new.raw_user_meta_data->>'date_of_birth')::date
      else null
    end,
    v_account_type,
    v_couple_type,
    v_partner_dob
  );
  return new;
end;
$$;
