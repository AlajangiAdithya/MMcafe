-- =============================================
-- DEBUG: figure out exactly why baristas insert is 403'ing.
-- Paste the output of the three final SELECTs back to me.
-- =============================================

-- 1. Show whether RLS is currently enabled on the table.
select 'rls_status' as check, relname, relrowsecurity as rls_on, relforcerowsecurity as rls_forced
  from pg_class
  where relname = 'baristas' and relnamespace = 'public'::regnamespace;

-- 2. Show every policy on baristas, including whether it's PERMISSIVE
--    or RESTRICTIVE, the command, and which roles it applies to.
select 'policies' as check, policyname, permissive, cmd, roles, qual, with_check
  from pg_policies
  where schemaname = 'public' and tablename = 'baristas';

-- 3. Show table-level grants for the API roles.
select 'grants' as check, grantee, privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'baristas'
    and grantee in ('anon', 'authenticated', 'public');
