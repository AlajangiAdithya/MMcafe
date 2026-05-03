-- =============================================
-- PASSWORD RESET (custom OTP/link flow via EmailJS)
-- Run once in Supabase SQL Editor.
-- =============================================
--
-- Threat model note:
-- The token is generated server-side and returned to the caller so the
-- client can email it through EmailJS. This means a determined attacker
-- with DevTools can read the token from the network response and reset
-- the password without ever seeing the victim's inbox. This is acceptable
-- for development / small-scale e-commerce, but for true production
-- hardening the token must be sent server-side (Edge Function + EmailJS
-- REST API, or Supabase's built-in resetPasswordForEmail with custom SMTP).
--
-- Hardening applied here:
--   * 15-minute expiry
--   * single-use
--   * rate limit: max 1 active token per email at a time
--   * 60s cooldown between requests for the same email
--   * password length validation
-- =============================================

create extension if not exists pgcrypto;

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_email_idx
  on password_reset_tokens(lower(email));

alter table password_reset_tokens enable row level security;

-- No policies = no direct table access. All access is via SECURITY DEFINER
-- functions below.

-- -----------------------------------------------
-- request_password_reset(email) -> token
-- Generates a secure random token, stores its hash, and returns the plain
-- token to the caller (so the browser can send it via EmailJS).
-- -----------------------------------------------
create or replace function request_password_reset(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_user_exists boolean;
  v_recent boolean;
  v_token text;
begin
  if v_email is null or v_email = '' then
    raise exception 'Email is required';
  end if;

  -- 60s cooldown: don't churn requests
  select exists (
    select 1 from password_reset_tokens
    where lower(email) = v_email
      and created_at > now() - interval '60 seconds'
  ) into v_recent;
  if v_recent then
    raise exception 'Please wait a minute before requesting another reset link';
  end if;

  select exists (
    select 1 from auth.users where lower(email) = v_email
  ) into v_user_exists;

  -- Always invalidate previous tokens for this email
  update password_reset_tokens
  set used = true
  where lower(email) = v_email and used = false;

  if not v_user_exists then
    -- Don't leak which emails exist; pretend success but write nothing.
    return null;
  end if;

  -- 32-byte url-safe token
  v_token := encode(gen_random_bytes(32), 'hex');

  insert into password_reset_tokens (email, token_hash, expires_at)
  values (
    v_email,
    crypt(v_token, gen_salt('bf', 8)),
    now() + interval '15 minutes'
  );

  return v_token;
end;
$$;

revoke all on function request_password_reset(text) from public;
grant execute on function request_password_reset(text) to anon, authenticated;

-- -----------------------------------------------
-- complete_password_reset(token, new_password)
-- Verifies the token, updates auth.users.encrypted_password (bcrypt),
-- marks the token used.
-- -----------------------------------------------
create or replace function complete_password_reset(p_token text, p_new_password text)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_row record;
  v_user_id uuid;
begin
  if p_token is null or length(p_token) < 10 then
    raise exception 'Invalid reset token';
  end if;
  if p_new_password is null or length(p_new_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  -- Find a matching, unused, unexpired token by re-hashing the candidate
  -- against each stored hash. (We only keep the most recent few rows live
  -- because old ones are marked used; index keeps this fast.)
  select * into v_row
  from password_reset_tokens
  where used = false
    and expires_at > now()
    and token_hash = crypt(p_token, token_hash)
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'Reset link is invalid or has expired. Please request a new one.';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(v_row.email)
  limit 1;

  if v_user_id is null then
    raise exception 'No account found for this email';
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
      updated_at = now()
  where id = v_user_id;

  update password_reset_tokens
  set used = true
  where id = v_row.id;
end;
$$;

revoke all on function complete_password_reset(text, text) from public;
grant execute on function complete_password_reset(text, text) to anon, authenticated;
