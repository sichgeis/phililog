-- No private family values in migrations. Populate birth_date separately in production.
alter table public.family_settings add column birth_date date;
alter table public.family_settings add constraint family_birth_date_valid
  check (birth_date is null or (isfinite(birth_date) and birth_date >= date '1900-01-01' and birth_date <= current_date));
grant update (birth_date) on public.family_settings to authenticated;
-- Existing family-only RLS, SELECT grant and version trigger apply unchanged.
