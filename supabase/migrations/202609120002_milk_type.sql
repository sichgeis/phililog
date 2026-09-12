alter table public.feedings add column milk_type text;
alter table public.feedings add constraint feeding_milk_type check (
  milk_type is null or (kind = 'bottle' and milk_type in ('pre', 'breast_milk'))
);
grant insert (milk_type), update (milk_type) on public.feedings to authenticated;
