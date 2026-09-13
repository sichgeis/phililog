-- Explicit one-time correction requested on 2026-09-13. Run in a transaction.
-- Keep the original rows in the private schema for administrative recovery only.
lock table public.feedings in share row exclusive mode;
create table private.events_before_20260913_correction as
 select * from public.feedings where kind in ('bottle', 'diaper', 'breast');
revoke all on private.events_before_20260913_correction from public, anon, authenticated;

update public.feedings f
set performed_by = case when f.kind = 'breast' then 'Julia' else 'Christian' end,
 estimated_ml = case when f.kind = 'breast' then case f.side when 'both' then 50 when 'left' then 25 when 'right' then 25 else null end else f.estimated_ml end
from private.events_before_20260913_correction b
where f.id = b.id
 and (f.performed_by is distinct from case when f.kind = 'breast' then 'Julia' else 'Christian' end
 or (f.kind = 'breast' and f.estimated_ml is distinct from case f.side when 'both' then 50 when 'left' then 25 when 'right' then 25 else null end));
