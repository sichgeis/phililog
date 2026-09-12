alter table public.feedings add column weight_g integer;
alter table public.feedings drop constraint feedings_kind_check;
alter table public.feedings add constraint feedings_kind_check check (kind in ('bottle', 'breast', 'diaper', 'weight'));
alter table public.feedings drop constraint feeding_details;
alter table public.feedings add constraint feeding_details check (
 (kind = 'bottle' and weight_g is null and amount_ml is not null and amount_ml > 0 and amount_ml % 5 = 0 and side is null and started_at is null and urine is null and stool is null and held_success is null)
 or (kind = 'breast' and weight_g is null and amount_ml is null and urine is null and stool is null and held_success is null)
 or (kind = 'diaper' and weight_g is null and amount_ml is null and side is null and started_at is null and duration_minutes is null and milk_type is null and urine is not null and stool is not null and held_success is not null)
 or (kind = 'weight' and weight_g is not null and weight_g > 0 and amount_ml is null and side is null and started_at is null and duration_minutes is null and milk_type is null and urine is null and stool is null and held_success is null)
);
grant insert (weight_g), update (weight_g) on public.feedings to authenticated;
