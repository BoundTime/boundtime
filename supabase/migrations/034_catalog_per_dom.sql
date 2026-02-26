-- Belohnungskatalog: Ein Katalog pro Dom (nicht pro Vereinbarung)
-- Bestehende Einträge werden migriert: dom_id aus arrangement übernommen.

alter table public.chastity_catalog_items
  add column if not exists dom_id uuid references public.profiles(id) on delete cascade;

update public.chastity_catalog_items c
set dom_id = a.dom_id
from public.chastity_arrangements a
where c.arrangement_id = a.id;

alter table public.chastity_catalog_items
  alter column dom_id set not null;

alter table public.chastity_catalog_items
  drop constraint if exists chastity_catalog_items_arrangement_id_fkey;

alter table public.chastity_catalog_items
  drop column arrangement_id;

create index if not exists chastity_catalog_items_dom_id on public.chastity_catalog_items(dom_id);

-- RLS aktualisieren
drop policy if exists "chastity_catalog_items_select" on public.chastity_catalog_items;
drop policy if exists "chastity_catalog_items_insert" on public.chastity_catalog_items;
drop policy if exists "chastity_catalog_items_update" on public.chastity_catalog_items;
drop policy if exists "chastity_catalog_items_delete" on public.chastity_catalog_items;

create policy "chastity_catalog_items_select" on public.chastity_catalog_items
  for select using (
    dom_id = auth.uid()
    or exists (
      select 1 from public.chastity_arrangements a
      where a.dom_id = chastity_catalog_items.dom_id and a.sub_id = auth.uid()
    )
  );

create policy "chastity_catalog_items_insert" on public.chastity_catalog_items
  for insert with check (dom_id = auth.uid());

create policy "chastity_catalog_items_update" on public.chastity_catalog_items
  for update using (dom_id = auth.uid());

create policy "chastity_catalog_items_delete" on public.chastity_catalog_items
  for delete using (dom_id = auth.uid());

-- approve_reward_request: Prüfen, dass Katalog-Item zur Dom der Vereinbarung gehört
create or replace function public.approve_reward_request(
  p_request_id uuid,
  p_comment text default null,
  p_unlock_start timestamptz default null,
  p_unlock_end timestamptz default null,
  p_unlock_duration_minutes int default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
begin
  select r.arrangement_id, r.catalog_item_id, r.requested_by,
         c.price_bound_dollars, c.requires_unlock, c.dom_id as catalog_dom_id,
         coalesce(c.custom_title, t.title) as reward_title
  into v_rec
  from public.chastity_reward_requests r
  left join public.chastity_catalog_items c on c.id = r.catalog_item_id
  left join public.chastity_reward_templates t on t.id = c.reward_template_id
  where r.id = p_request_id and r.status = 'pending';
  if not found then
    raise exception 'Anfrage nicht gefunden oder nicht mehr ausstehend';
  end if;
  if not exists (select 1 from public.chastity_arrangements a where a.id = v_rec.arrangement_id and a.dom_id = auth.uid()) then
    raise exception 'Du bist nicht die Dom dieser Vereinbarung';
  end if;
  if exists (select 1 from public.chastity_arrangements a where a.id = v_rec.arrangement_id and a.dom_id != v_rec.catalog_dom_id) then
    raise exception 'Katalog-Item gehört nicht zu dieser Vereinbarung';
  end if;
  if (select bound_dollars from public.chastity_arrangements where id = v_rec.arrangement_id) < coalesce(v_rec.price_bound_dollars, 0) then
    raise exception 'Sub hat nicht genug BoundDollars';
  end if;
  update public.chastity_arrangements
  set bound_dollars = greatest(0, bound_dollars - coalesce(v_rec.price_bound_dollars, 0)),
      updated_at = now()
  where id = v_rec.arrangement_id;
  update public.chastity_reward_requests
  set status = 'approved', dom_comment = p_comment, approved_at = now()
  where id = p_request_id;
  if v_rec.requires_unlock then
    insert into public.chastity_unlock_log (arrangement_id, reward_request_id, start_at, end_at, duration_minutes, reward_title)
    values (
      v_rec.arrangement_id,
      p_request_id,
      coalesce(p_unlock_start, now()),
      p_unlock_end,
      p_unlock_duration_minutes,
      v_rec.reward_title
    );
  end if;
end;
$$;
