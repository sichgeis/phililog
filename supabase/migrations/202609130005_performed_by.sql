-- Existing entries remain unassigned: recording does not prove who performed the task.
alter table public.feedings add column performed_by text check (performed_by in ('Julia', 'Christian'));
create function private.assign_performer() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select person into new.performed_by from private.members where user_id = auth.uid();
  return new;
end;
$$;
revoke all on function private.assign_performer() from public, anon, authenticated;
create trigger assign_performer before insert on public.feedings for each row execute function private.assign_performer();
grant update (performed_by) on public.feedings to authenticated;
