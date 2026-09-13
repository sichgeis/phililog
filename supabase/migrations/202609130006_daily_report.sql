alter table public.feedings add column estimated_ml integer;
alter table public.feedings add constraint feeding_estimate check (estimated_ml is null or (kind = 'breast' and estimated_ml >= 0));
grant insert (estimated_ml), update (estimated_ml) on public.feedings to authenticated;

create table public.family_settings (
 id boolean primary key default true check (id),
 breast_ml integer not null default 25 check (breast_ml > 0),
 version integer not null default 1
);
insert into public.family_settings default values;
alter table public.family_settings enable row level security;
revoke all on public.family_settings from public, anon, authenticated;
grant select on public.family_settings to authenticated;
grant update (breast_ml) on public.family_settings to authenticated;
create policy settings_read on public.family_settings for select to authenticated using ((select public.is_family_member()));
create policy settings_update on public.family_settings for update to authenticated using ((select public.is_family_member())) with check ((select public.is_family_member()));
create function private.stamp_settings() returns trigger language plpgsql set search_path = '' as $$
begin new.version := old.version + 1; return new; end;
$$;
create trigger stamp_settings before update on public.family_settings for each row execute function private.stamp_settings();

create function public.daily_report(first_day date, last_day date)
returns table(day date, bottle_ml bigint, breast_ml bigint, missing_estimates bigint, diapers bigint, wet bigint, stool bigint, events bigint)
language plpgsql stable security invoker set search_path = '' as $$
begin
 if not public.is_family_member() then raise insufficient_privilege; end if;
 if first_day is null or last_day is null or last_day < first_day or last_day - first_day > 30 then raise exception 'Invalid report range'; end if;
 return query
 with days as (select first_day + s as d from pg_catalog.generate_series(0, last_day - first_day) s),
 totals as (
  select (f.occurred_at at time zone 'Europe/Berlin')::date as d,
   coalesce(sum(f.amount_ml) filter (where f.kind = 'bottle'),0) as bottle,
   coalesce(sum(f.estimated_ml) filter (where f.kind = 'breast'),0) as breast,
   count(*) filter (where f.kind = 'breast' and f.estimated_ml is null) as missing,
   count(*) filter (where f.kind = 'diaper') as diapers,
   count(*) filter (where f.kind = 'diaper' and f.urine) as wet,
   count(*) filter (where f.kind = 'diaper' and f.stool) as stool,
   count(*) as events
  from public.feedings f
  where f.occurred_at >= (first_day::timestamp at time zone 'Europe/Berlin')
    and f.occurred_at < ((last_day + 1)::timestamp at time zone 'Europe/Berlin')
  group by 1
 )
 select days.d,coalesce(t.bottle,0),coalesce(t.breast,0),coalesce(t.missing,0),coalesce(t.diapers,0),coalesce(t.wet,0),coalesce(t.stool,0),coalesce(t.events,0)
 from days left join totals t on t.d = days.d order by days.d desc;
end;
$$;
revoke all on function public.daily_report(date,date) from public, anon;
grant execute on function public.daily_report(date,date) to authenticated;
