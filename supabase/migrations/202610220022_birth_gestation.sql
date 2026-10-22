-- Optionale private Profilangabe; keine familienspezifischen Vorgaben.
alter table public.family_settings add column gestational_age_days integer;
alter table public.family_settings add constraint family_gestation_valid
  check (gestational_age_days is null or gestational_age_days between 154 and 314);
grant update (gestational_age_days) on public.family_settings to authenticated;
-- Vorhandene RLS, SELECT-Rechte und Versionsprüfung bleiben erhalten.
