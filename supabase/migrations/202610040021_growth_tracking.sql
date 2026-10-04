-- Optionale Angaben. Keine echten Profilwerte oder Messungen in Migrationen.
alter table public.family_settings add column birth_weight_g integer;
alter table public.family_settings add constraint family_birth_weight_valid
  check (birth_weight_g is null or birth_weight_g between 300 and 10000);
grant update (birth_weight_g) on public.family_settings to authenticated;
alter table public.feedings add column length_cm numeric(4,1);
alter table public.feedings add constraint weight_length_valid
  check (length_cm is null or (kind = 'weight' and length_cm between 30 and 150));
grant insert (length_cm), update (length_cm) on public.feedings to authenticated;
-- Familien-RLS, SELECT-Rechte und bestehende Versionsprüfung bleiben erhalten.
