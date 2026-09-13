alter table public.family_settings add column breast_left_ml integer check (breast_left_ml > 0), add column breast_right_ml integer check (breast_right_ml > 0);
update public.family_settings set breast_left_ml = breast_ml, breast_right_ml = breast_ml;
alter table public.family_settings alter column breast_left_ml set not null, alter column breast_right_ml set not null;
grant update (breast_left_ml, breast_right_ml) on public.family_settings to authenticated;
-- Keep older app versions able to save their shared standard during rollout.
create function private.sync_legacy_breast_defaults() returns trigger language plpgsql set search_path = '' as $$
begin new.breast_left_ml := new.breast_ml; new.breast_right_ml := new.breast_ml; return new; end;
$$;
create trigger sync_legacy_breast_defaults before update of breast_ml on public.family_settings for each row execute function private.sync_legacy_breast_defaults();
