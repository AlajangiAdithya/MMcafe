-- =============================================
-- ACCESS EXPIRY
-- - Cafe directory access (barista_access) expires 20 days after paid_at,
--   unless an admin revokes it sooner. Once expired, cafe must pay again.
-- - Course enrollments (enrollments) expire 30 days after enrolled_at.
--   After that, the user has to re-enroll.
-- - Admin can revoke a cafe's directory access manually (e.g. after a
--   successful hire) via mark_cafe_access_revoked RPC.
-- Run in Supabase SQL Editor. Idempotent.
-- =============================================

-- ---------- 1. barista_access: add expires_at + revoked_at ----------
alter table public.barista_access
  add column if not exists expires_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_reason text;

-- Backfill expires_at for existing rows (paid_at + 20 days).
update public.barista_access
  set expires_at = paid_at + interval '20 days'
  where expires_at is null;

-- Default for new rows: 20 days from paid_at.
alter table public.barista_access
  alter column expires_at set default (now() + interval '20 days');

-- Trigger: keep expires_at in sync when paid_at is updated (e.g. on re-purchase).
create or replace function public.set_barista_access_expiry()
returns trigger language plpgsql as $$
begin
  -- On insert with no expires_at, or on any update where paid_at changed,
  -- recompute the expiry window. This way an upsert on re-payment extends access.
  if (TG_OP = 'INSERT' and new.expires_at is null) then
    new.expires_at := coalesce(new.paid_at, now()) + interval '20 days';
  elsif (TG_OP = 'UPDATE' and new.paid_at is distinct from old.paid_at) then
    new.expires_at := new.paid_at + interval '20 days';
    new.revoked_at := null;          -- a fresh payment clears any revoke
    new.revoked_reason := null;
  end if;
  return new;
end $$;

drop trigger if exists trg_barista_access_expiry on public.barista_access;
create trigger trg_barista_access_expiry
  before insert or update on public.barista_access
  for each row execute function public.set_barista_access_expiry();

-- ---------- 1b. SECURITY DEFINER RPC for granting/extending access ----------
-- Why an RPC: the original PostgREST upsert from the client hits the UPDATE
-- branch on re-payment, but barista_access has no UPDATE policy (and we
-- intentionally don't add one — a user mustn't be able to clear their own
-- revoked_at). The RPC bypasses RLS and centralises the (re)grant logic.
create or replace function public.grant_barista_access(
  p_payment_id text,
  p_amount integer
)
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

  insert into public.barista_access (user_id, payment_id, amount, paid_at)
  values (v_user, p_payment_id, p_amount, now())
  on conflict (user_id) do update
    set payment_id = excluded.payment_id,
        amount = excluded.amount,
        paid_at = now();
  -- The before-insert/update trigger on this table recomputes expires_at
  -- and clears revoked_at when paid_at changes.
end $$;

grant execute on function public.grant_barista_access(text, integer) to authenticated;

-- ---------- 2. Tighten the baristas SELECT policy: only ACTIVE access ----------
-- A cafe can read a mapped barista only while their access is active
-- (not expired, not revoked). Admins keep full read.
drop policy if exists "Assigned cafes can read their baristas" on public.baristas;

create policy "Assigned cafes can read their baristas"
  on public.baristas
  for select
  to authenticated
  using (
    approved = true
    and exists (
      select 1
      from public.barista_assignments ba
      join public.barista_access acc on acc.user_id = ba.cafe_user_id
      where ba.cafe_user_id = auth.uid()
        and ba.barista_id = baristas.id
        and acc.revoked_at is null
        and (acc.expires_at is null or acc.expires_at > now())
    )
  );

-- ---------- 3. Admin RPC to revoke a cafe's access ----------
create or replace function public.admin_revoke_cafe_access(
  p_user_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Only admins can revoke access';
  end if;

  update public.barista_access
    set revoked_at = now(),
        revoked_reason = p_reason
    where user_id = p_user_id;

  -- Drop their assignments so they can't see the baristas anymore.
  delete from public.barista_assignments where cafe_user_id = p_user_id;
end $$;

grant execute on function public.admin_revoke_cafe_access(uuid, text) to authenticated;

-- ---------- 4. enrollments: 30-day expiry ----------
alter table public.enrollments
  add column if not exists expires_at timestamptz;

update public.enrollments
  set expires_at = enrolled_at + interval '30 days'
  where expires_at is null;

alter table public.enrollments
  alter column expires_at set default (now() + interval '30 days');

create or replace function public.set_enrollment_expiry()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT' and new.expires_at is null) then
    new.expires_at := coalesce(new.enrolled_at, now()) + interval '30 days';
  elsif (TG_OP = 'UPDATE' and new.enrolled_at is distinct from old.enrolled_at) then
    new.expires_at := new.enrolled_at + interval '30 days';
  end if;
  return new;
end $$;

drop trigger if exists trg_enrollment_expiry on public.enrollments;
create trigger trg_enrollment_expiry
  before insert or update on public.enrollments
  for each row execute function public.set_enrollment_expiry();

-- Sanity: surface counts so we can confirm the migration ran.
select 'barista_access_active' as check,
       count(*) filter (where (expires_at is null or expires_at > now()) and revoked_at is null) as active,
       count(*) filter (where revoked_at is not null) as revoked,
       count(*) filter (where expires_at <= now() and revoked_at is null) as expired
  from public.barista_access;

select 'enrollments_active' as check,
       count(*) filter (where expires_at > now()) as active,
       count(*) filter (where expires_at <= now()) as expired
  from public.enrollments;
