-- =============================================
-- BARISTA ASSIGNMENTS
-- New flow: cafe pays → admin manually maps 5 approved baristas to that cafe.
-- The cafe only sees the baristas mapped to them (not every approved barista).
-- Run this in Supabase SQL Editor. Idempotent.
-- =============================================

create table if not exists public.barista_assignments (
  id bigint generated always as identity primary key,
  cafe_user_id uuid not null references auth.users on delete cascade,
  barista_id  bigint not null references public.baristas on delete cascade,
  assigned_at timestamptz default now(),
  unique (cafe_user_id, barista_id)
);

create index if not exists barista_assignments_cafe_idx
  on public.barista_assignments (cafe_user_id);
create index if not exists barista_assignments_barista_idx
  on public.barista_assignments (barista_id);

alter table public.barista_assignments enable row level security;

-- Wipe any prior policies so a re-run is clean.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'barista_assignments'
  loop
    execute format('drop policy if exists %I on public.barista_assignments', pol.policyname);
  end loop;
end $$;

-- Cafes can read their own assignments only.
create policy "Cafes read own assignments"
  on public.barista_assignments
  for select
  to authenticated
  using (cafe_user_id = auth.uid());

-- Admins can read everything.
create policy "Admins read all assignments"
  on public.barista_assignments
  for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Only admins can create / change / remove mappings.
create policy "Admins insert assignments"
  on public.barista_assignments
  for insert
  to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins update assignments"
  on public.barista_assignments
  for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins delete assignments"
  on public.barista_assignments
  for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

grant select, insert, update, delete on table public.barista_assignments to authenticated;

-- =============================================
-- Update baristas SELECT policy: cafes now see only the baristas
-- mapped to them, not every approved barista.
-- =============================================

drop policy if exists "Paid users can read approved baristas" on public.baristas;
drop policy if exists "Assigned cafes can read their baristas" on public.baristas;

create policy "Assigned cafes can read their baristas"
  on public.baristas
  for select
  to authenticated
  using (
    approved = true
    and exists (
      select 1 from public.barista_assignments
      where cafe_user_id = auth.uid() and barista_id = baristas.id
    )
  );

-- Verification — should return rows.
select 'assignments_policies' as check, policyname, cmd, roles
  from pg_policies
  where schemaname = 'public' and tablename = 'barista_assignments';

select 'baristas_policies' as check, policyname, cmd, roles
  from pg_policies
  where schemaname = 'public' and tablename = 'baristas';
