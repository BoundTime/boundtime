-- Timeline / Aktivitätsprotokoll (ableitbar aus vorhandenen Tabellen)
-- View für chronologische Übersicht

create or replace view public.chastity_activity_view as
select
  t.arrangement_id,
  t.completed_at as happened_at,
  'task_completed' as activity_type,
  t.title as title,
  t.bound_dollars_on_completion as bound_dollars,
  null::uuid as related_id,
  a.sub_id as sub_id
from public.chastity_tasks t
join public.chastity_arrangements a on a.id = t.arrangement_id
where t.status = 'completed' and t.completed_at is not null

union all

select
  r.arrangement_id,
  r.approved_at as happened_at,
  'reward_approved' as activity_type,
  'Belohnung genehmigt' as title,
  -coalesce(c.price_bound_dollars, 0) as bound_dollars,
  r.id as related_id,
  r.requested_by as sub_id
from public.chastity_reward_requests r
left join public.chastity_catalog_items c on c.id = r.catalog_item_id
where r.status = 'approved' and r.approved_at is not null

union all

select
  u.arrangement_id,
  u.start_at as happened_at,
  'unlock' as activity_type,
  coalesce(u.reward_title, 'Unlock') as title,
  null::int as bound_dollars,
  u.id as related_id,
  a.sub_id as sub_id
from public.chastity_unlock_log u
join public.chastity_arrangements a on a.id = u.arrangement_id
where u.start_at is not null;

grant select on public.chastity_activity_view to authenticated;
