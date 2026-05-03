-- =============================================
-- FIX: "new row violates row-level security policy for table baristas"
-- Run this in Supabase SQL Editor (paste the WHOLE file, hit Run).
-- Idempotent: safe to run multiple times.
-- =============================================

-- 1. Drop EVERY policy on baristas (regardless of name) so old / wrong
--    policies from earlier setups can't keep blocking inserts.
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'baristas'
  loop
    execute format('drop policy if exists %I on public.baristas', pol.policyname);
  end loop;
end $$;

-- 2. Make sure RLS is actually on.
alter table public.baristas enable row level security;

-- 3. Email is optional (many baristas don't have one).
alter table public.baristas alter column email drop not null;

-- 4. Grant table-level INSERT to the API roles. RLS still applies, but
--    without the grant Postgres rejects the insert before RLS even runs.
grant insert, select on table public.baristas to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- 5. Re-create the policies fresh.

create policy "Anyone can submit a barista"
  on public.baristas
  for insert
  to anon, authenticated
  with check (true);

create policy "Paid users can read approved baristas"
  on public.baristas
  for select
  to authenticated
  using (
    approved = true
    and exists (select 1 from public.barista_access where user_id = auth.uid())
  );

create policy "Admins can read all baristas"
  on public.baristas
  for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update baristas"
  on public.baristas
  for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete baristas"
  on public.baristas
  for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 6. Verification — these should both come back with rows.
--    If they don't, the script didn't actually run.
select 'policies_on_baristas' as check, policyname, cmd, roles
  from pg_policies
  where schemaname = 'public' and tablename = 'baristas';

select 'grants_on_baristas' as check, grantee, privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'baristas'
    and grantee in ('anon', 'authenticated');
