-- =============================================
-- BARISTA HIRED FLOW
-- When a cafe finalizes a hire, they click a button on the directory page.
-- The barista is then marked hired (soft-removed) and unmapped from every
-- cafe so no one else sees them. Admin can still view hired records and
-- hard-delete from the Baristas tab if desired.
-- Run this in Supabase SQL Editor. Idempotent.
-- =============================================

alter table public.baristas
  add column if not exists hired_at timestamptz,
  add column if not exists hired_by_user_id uuid references auth.users on delete set null;

create index if not exists baristas_hired_idx on public.baristas (hired_at);

-- Cafes only see baristas who are approved, NOT hired, AND mapped to them.
drop policy if exists "Assigned cafes can read their baristas" on public.baristas;

create policy "Assigned cafes can read their baristas"
  on public.baristas
  for select
  to authenticated
  using (
    approved = true
    and hired_at is null
    and exists (
      select 1 from public.barista_assignments
      where cafe_user_id = auth.uid() and barista_id = baristas.id
    )
  );

-- =============================================
-- mark_barista_hired(bigint)
-- The cafe calls this from the directory page. Verifies the caller has an
-- assignment to that barista, sets hired_at, then drops every mapping for
-- the barista so no other cafe will see them.
-- =============================================
create or replace function public.mark_barista_hired(p_barista_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.barista_assignments
    where cafe_user_id = v_user and barista_id = p_barista_id
  ) then
    raise exception 'You can only hire baristas mapped to your cafe.';
  end if;

  update public.baristas
    set hired_at = now(),
        hired_by_user_id = v_user
    where id = p_barista_id and hired_at is null;

  delete from public.barista_assignments where barista_id = p_barista_id;
end;
$$;

grant execute on function public.mark_barista_hired(bigint) to authenticated;
