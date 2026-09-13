-- Nur die eigene freigeschaltete Rolle für die sichtbare Zuordnung anzeigen.
create function public.current_family_person() returns text
language sql stable security definer set search_path = '' as $$
  select person from private.members where user_id = (select auth.uid());
$$;
revoke all on function public.current_family_person() from public, anon;
grant execute on function public.current_family_person() to authenticated;
