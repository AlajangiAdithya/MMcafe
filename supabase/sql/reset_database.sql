-- ============================================================================
-- ⚠️  FULL DATABASE RESET  —  DELETES ALL DATA. THIS CANNOT BE UNDONE.
-- ============================================================================
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- KEEPS  : every table, column, RLS policy, storage bucket and edge function.
--          (The schema is untouched — the app keeps working, just empty.)
-- REMOVES: every row in every public table, AND every user account
--          (auth.users + profiles). You WILL be logged out and lose admin.
--
-- ❗ RUN THE STORAGE WIPE FIRST (scripts/wipe-storage.mjs, or empty the buckets
--    in the dashboard). Deleting rows here does NOT free the actual image /
--    video / PDF files in Storage, and emptying the buckets first also avoids
--    a foreign-key conflict when auth.users is deleted below.
--
-- There is no "undo". Make sure you have a backup if you might want this data
-- back (Dashboard → Database → Backups, or Point-in-Time Recovery).
-- ============================================================================

begin;

-- 1) Empty EVERY table in the public schema. Looping over pg_tables means we
--    never miss a table and never error on one that doesn't exist.
--    RESTART IDENTITY resets the id counters back to 1; CASCADE clears any
--    foreign-key-dependent rows in the same pass.
do $$
declare r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('truncate table public.%I restart identity cascade', r.tablename);
  end loop;
end $$;

-- 2) Delete every user account. This cascades through the auth schema
--    (identities, sessions, refresh tokens, MFA factors) automatically.
delete from auth.users;

commit;

-- ----------------------------------------------------------------------------
-- Sanity check (optional): every count below should be 0.
-- ----------------------------------------------------------------------------
-- select 'auth.users' as t, count(*) from auth.users
-- union all select 'profiles',  count(*) from public.profiles
-- union all select 'products',  count(*) from public.products
-- union all select 'courses',   count(*) from public.courses
-- union all select 'books',     count(*) from public.books
-- union all select 'orders',    count(*) from public.orders;
