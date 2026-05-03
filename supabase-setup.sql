-- =============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =============================================

-- 1. PROFILES TABLE (stores user info on signup)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  first_name text,
  last_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Anyone can read profiles"     on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Anyone can read profiles"
  on profiles for select using (true);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- 2. PRODUCTS TABLE
create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null,
  category text default 'beans',
  weight text,
  image text,
  description text,
  in_stock boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- Backfill column for existing deployments
alter table products add column if not exists is_featured boolean default false;
create index if not exists products_is_featured_idx on products (is_featured) where is_featured = true;

alter table products enable row level security;

drop policy if exists "Anyone can read products"   on products;
drop policy if exists "Anyone can insert products" on products;
drop policy if exists "Anyone can update products" on products;
drop policy if exists "Anyone can delete products" on products;

create policy "Anyone can read products"
  on products for select using (true);

create policy "Anyone can insert products"
  on products for insert with check (true);

create policy "Anyone can update products"
  on products for update using (true);

create policy "Anyone can delete products"
  on products for delete using (true);

-- 3. COURSES TABLE
create table if not exists courses (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  price integer default 0,
  duration text,
  lessons integer default 0,
  rating numeric(2,1) default 4.5,
  level text default 'Beginner',
  image text,
  video_url text,
  free boolean default false,
  created_at timestamptz default now()
);

alter table courses enable row level security;

drop policy if exists "Anyone can read courses"   on courses;
drop policy if exists "Anyone can insert courses" on courses;
drop policy if exists "Anyone can update courses" on courses;
drop policy if exists "Anyone can delete courses" on courses;

create policy "Anyone can read courses"
  on courses for select using (true);

create policy "Anyone can insert courses"
  on courses for insert with check (true);

create policy "Anyone can update courses"
  on courses for update using (true);

create policy "Anyone can delete courses"
  on courses for delete using (true);

-- 4. ORDERS TABLE
create table if not exists orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users,
  items jsonb,
  total integer,
  shipping_address jsonb,
  payment_id text,
  status text default 'confirmed',
  created_at timestamptz default now()
);

alter table orders enable row level security;

drop policy if exists "Anyone can read orders"                on orders;
drop policy if exists "Authenticated users can create orders" on orders;

create policy "Anyone can read orders"
  on orders for select using (true);

create policy "Authenticated users can create orders"
  on orders for insert with check (auth.uid() = user_id);

-- =============================================
-- AFTER RUNNING THE ABOVE, MAKE YOUR ACCOUNT ADMIN:
-- Replace 'your-email@example.com' with your actual email
-- =============================================
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';


-- =============================================
-- v2 UPGRADE: Storage buckets, enrollments, reviews,
-- order status workflow, hardened RLS (admin-only writes)
-- Safe to re-run.
-- =============================================

-- 5. STORAGE BUCKETS (public-read, admin-write)
insert into storage.buckets (id, name, public)
values
  ('product-images',    'product-images',    true),
  ('course-videos',     'course-videos',     true),
  ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do nothing;

-- Helper: drop+recreate storage policies for a bucket
drop policy if exists "Public read product-images"     on storage.objects;
drop policy if exists "Admin write product-images"     on storage.objects;
drop policy if exists "Public read course-videos"      on storage.objects;
drop policy if exists "Admin write course-videos"      on storage.objects;
drop policy if exists "Public read course-thumbnails"  on storage.objects;
drop policy if exists "Admin write course-thumbnails"  on storage.objects;

create policy "Public read product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');
create policy "Admin write product-images"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and is_admin)
  )
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and is_admin)
  );

create policy "Public read course-videos"
  on storage.objects for select
  using (bucket_id = 'course-videos');
create policy "Admin write course-videos"
  on storage.objects for all
  using (
    bucket_id = 'course-videos'
    and exists (select 1 from profiles where id = auth.uid() and is_admin)
  )
  with check (
    bucket_id = 'course-videos'
    and exists (select 1 from profiles where id = auth.uid() and is_admin)
  );

create policy "Public read course-thumbnails"
  on storage.objects for select
  using (bucket_id = 'course-thumbnails');
create policy "Admin write course-thumbnails"
  on storage.objects for all
  using (
    bucket_id = 'course-thumbnails'
    and exists (select 1 from profiles where id = auth.uid() and is_admin)
  )
  with check (
    bucket_id = 'course-thumbnails'
    and exists (select 1 from profiles where id = auth.uid() and is_admin)
  );

-- 6. HARDEN PRODUCTS / COURSES RLS (admin-only writes)
drop policy if exists "Anyone can insert products" on products;
drop policy if exists "Anyone can update products" on products;
drop policy if exists "Anyone can delete products" on products;
drop policy if exists "Admins write products"     on products;

create policy "Admins write products"
  on products for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

drop policy if exists "Anyone can insert courses" on courses;
drop policy if exists "Anyone can update courses" on courses;
drop policy if exists "Anyone can delete courses" on courses;
drop policy if exists "Admins write courses"     on courses;

create policy "Admins write courses"
  on courses for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- 7. ORDERS: status column + hardened RLS
alter table orders
  add column if not exists status text default 'confirmed';

-- Add a status check constraint (drop+add for idempotency)
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('confirmed','processing','shipped','delivered','cancelled'));

drop policy if exists "Anyone can read orders"                  on orders;
drop policy if exists "Authenticated users can create orders"   on orders;
drop policy if exists "Users read own orders"                   on orders;
drop policy if exists "Admins read all orders"                  on orders;
drop policy if exists "Admins update orders"                    on orders;

create policy "Users read own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Admins read all orders"
  on orders for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

create policy "Authenticated users can create orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Admins update orders"
  on orders for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- 8. ENROLLMENTS TABLE
create table if not exists enrollments (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  course_id bigint references courses on delete cascade,
  payment_id text,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

alter table enrollments enable row level security;

drop policy if exists "Users read own enrollments"   on enrollments;
drop policy if exists "Users create own enrollments" on enrollments;
drop policy if exists "Admins read all enrollments"  on enrollments;

create policy "Users read own enrollments"
  on enrollments for select
  using (auth.uid() = user_id);

create policy "Users create own enrollments"
  on enrollments for insert
  with check (auth.uid() = user_id);

create policy "Admins read all enrollments"
  on enrollments for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- 9. REVIEWS TABLE
create table if not exists reviews (
  id bigint generated always as identity primary key,
  product_id bigint references products on delete cascade,
  user_id   uuid    references auth.users on delete cascade,
  rating    smallint check (rating between 1 and 5),
  comment   text,
  approved  boolean default true,
  created_at timestamptz default now(),
  unique(product_id, user_id)
);

alter table reviews enable row level security;

drop policy if exists "Anyone reads approved reviews" on reviews;
drop policy if exists "Admins read all reviews"       on reviews;
drop policy if exists "Users write own reviews"       on reviews;
drop policy if exists "Users update own reviews"      on reviews;
drop policy if exists "Users delete own reviews"      on reviews;
drop policy if exists "Admins moderate reviews"       on reviews;
drop policy if exists "Admins delete reviews"         on reviews;

create policy "Anyone reads approved reviews"
  on reviews for select
  using (approved = true);

create policy "Admins read all reviews"
  on reviews for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

create policy "Users write own reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users update own reviews"
  on reviews for update
  using (auth.uid() = user_id);

create policy "Users delete own reviews"
  on reviews for delete
  using (auth.uid() = user_id);

create policy "Admins moderate reviews"
  on reviews for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

create policy "Admins delete reviews"
  on reviews for delete
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));


-- =============================================
-- v3 UPGRADE: Lessons, lesson progress, coupons,
-- wishlist, persistent cart, stock quantity, helper RPCs.
-- Safe to re-run.
-- =============================================

-- 10. PRODUCTS: stock quantity
alter table products
  add column if not exists stock_quantity integer default 0;

-- Mirror in_stock from quantity (one-way: in_stock = qty > 0)
update products set in_stock = (coalesce(stock_quantity, 0) > 0)
  where stock_quantity is not null;

-- 11. LESSONS TABLE — multi-lesson courses
create table if not exists lessons (
  id bigint generated always as identity primary key,
  course_id bigint references courses on delete cascade,
  title text not null,
  description text,
  video_url text,
  duration_seconds integer default 0,
  position integer not null default 0,
  preview boolean default false,
  created_at timestamptz default now()
);

create index if not exists lessons_course_idx on lessons(course_id, position);

alter table lessons enable row level security;

drop policy if exists "Public read preview lessons"   on lessons;
drop policy if exists "Enrolled read lessons"         on lessons;
drop policy if exists "Admins write lessons"          on lessons;

-- Anyone can read preview lessons (and for free courses, all lessons)
create policy "Public read preview lessons"
  on lessons for select
  using (
    preview = true
    or exists (select 1 from courses c where c.id = course_id and c.free)
  );

-- Enrolled users can read all lessons of their courses
create policy "Enrolled read lessons"
  on lessons for select
  using (
    exists (
      select 1 from enrollments e
      where e.course_id = lessons.course_id and e.user_id = auth.uid()
    )
  );

create policy "Admins write lessons"
  on lessons for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- 12. LESSON PROGRESS — per-user resume + completion
create table if not exists lesson_progress (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  lesson_id bigint references lessons on delete cascade,
  course_id bigint references courses on delete cascade,
  position_seconds integer default 0,
  completed boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx on lesson_progress(user_id, course_id);

alter table lesson_progress enable row level security;

drop policy if exists "Users read own progress"     on lesson_progress;
drop policy if exists "Users write own progress"    on lesson_progress;
drop policy if exists "Admins read all progress"    on lesson_progress;

create policy "Users read own progress"
  on lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users write own progress"
  on lesson_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins read all progress"
  on lesson_progress for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- 13. COUPONS TABLE
create table if not exists coupons (
  id bigint generated always as identity primary key,
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percent','flat')),
  discount_value integer not null check (discount_value > 0),
  min_order_total integer default 0,
  max_uses integer,
  uses integer default 0,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table coupons enable row level security;

drop policy if exists "Anyone read active coupons" on coupons;
drop policy if exists "Admins manage coupons"      on coupons;

create policy "Anyone read active coupons"
  on coupons for select
  using (active = true);

create policy "Admins manage coupons"
  on coupons for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- Helper: validate + compute discount for a coupon code (returns json)
create or replace function validate_coupon(p_code text, p_subtotal integer)
returns table (
  ok boolean,
  message text,
  discount integer,
  coupon_id bigint
) language plpgsql security definer set search_path = public as $$
declare
  c coupons%rowtype;
  d integer := 0;
begin
  select * into c from coupons where lower(code) = lower(p_code);
  if not found then
    return query select false, 'Invalid code', 0, null::bigint;
    return;
  end if;
  if not c.active then
    return query select false, 'Coupon disabled', 0, c.id;
    return;
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    return query select false, 'Coupon expired', 0, c.id;
    return;
  end if;
  if c.max_uses is not null and c.uses >= c.max_uses then
    return query select false, 'Coupon limit reached', 0, c.id;
    return;
  end if;
  if p_subtotal < coalesce(c.min_order_total, 0) then
    return query select false,
      format('Minimum order ₹%s', c.min_order_total), 0, c.id;
    return;
  end if;
  if c.discount_type = 'percent' then
    d := (p_subtotal * c.discount_value) / 100;
  else
    d := c.discount_value;
  end if;
  if d > p_subtotal then d := p_subtotal; end if;
  return query select true, 'Applied', d, c.id;
end;
$$;

-- 14. WISHLIST
create table if not exists wishlist (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  product_id bigint references products on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table wishlist enable row level security;

drop policy if exists "Users manage own wishlist" on wishlist;

create policy "Users manage own wishlist"
  on wishlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 15. PERSISTENT CART
create table if not exists cart_items (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  product_id bigint references products on delete cascade,
  qty integer not null default 1 check (qty > 0),
  updated_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table cart_items enable row level security;

drop policy if exists "Users manage own cart" on cart_items;

create policy "Users manage own cart"
  on cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 16. STOCK DECREMENT RPC (atomic, callable by authenticated users)
-- Used after a successful payment to decrement stock for each item ordered.
create or replace function decrement_stock(p_items jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  it jsonb;
begin
  for it in select * from jsonb_array_elements(p_items)
  loop
    update products
       set stock_quantity = greatest(0, coalesce(stock_quantity, 0) - (it->>'qty')::int),
           in_stock = (greatest(0, coalesce(stock_quantity, 0) - (it->>'qty')::int) > 0)
     where id = (it->>'id')::bigint;
  end loop;
end;
$$;

revoke all on function decrement_stock(jsonb) from public;
grant execute on function decrement_stock(jsonb) to authenticated;
grant execute on function validate_coupon(text, integer) to anon, authenticated;

-- 17. COUPON USAGE INCREMENT RPC
create or replace function increment_coupon_use(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  update coupons set uses = coalesce(uses, 0) + 1 where id = p_id;
end;
$$;

grant execute on function increment_coupon_use(bigint) to authenticated;

-- 18. CERTIFICATES (issued when course is 100% complete)
create table if not exists certificates (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  course_id bigint references courses on delete cascade,
  issued_at timestamptz default now(),
  unique(user_id, course_id)
);

alter table certificates enable row level security;
drop policy if exists "Users read own certs"  on certificates;
drop policy if exists "Users issue own certs" on certificates;

create policy "Users read own certs"
  on certificates for select
  using (auth.uid() = user_id);

create policy "Users issue own certs"
  on certificates for insert
  with check (auth.uid() = user_id);

-- =============================================
-- v4 UPGRADE: Lesson thumbnails. Safe to re-run.
-- =============================================
alter table lessons
  add column if not exists thumbnail text;

-- =============================================
-- v5 UPGRADE: Atomic order + stock RPC, payment idempotency, error log.
-- Safe to re-run.
-- =============================================

-- Idempotency: prevent duplicate order rows for the same Razorpay payment_id
create unique index if not exists orders_payment_id_unique
  on orders (payment_id)
  where payment_id is not null;

-- Atomic: insert order, decrement stock, optionally bump coupon use, clear cart.
-- All-or-nothing in a single transaction.
create or replace function create_order_with_stock(
  p_user_id uuid,
  p_items jsonb,
  p_total numeric,
  p_shipping_address jsonb,
  p_payment_id text,
  p_coupon_id bigint default null
) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_order_id bigint;
  it jsonb;
begin
  -- Idempotency: if this payment already produced an order, return that id
  select id into v_order_id from orders where payment_id = p_payment_id limit 1;
  if v_order_id is not null then
    return v_order_id;
  end if;

  insert into orders (user_id, items, total, shipping_address, payment_id, status)
  values (p_user_id, p_items, p_total, coalesce(p_shipping_address, '{}'::jsonb), p_payment_id, 'confirmed')
  returning id into v_order_id;

  for it in select * from jsonb_array_elements(p_items)
  loop
    update products
       set stock_quantity = greatest(0, coalesce(stock_quantity, 0) - (it->>'qty')::int),
           in_stock = (greatest(0, coalesce(stock_quantity, 0) - (it->>'qty')::int) > 0)
     where id = (it->>'id')::bigint;
  end loop;

  if p_coupon_id is not null then
    update coupons set uses = coalesce(uses, 0) + 1 where id = p_coupon_id;
  end if;

  delete from cart_items where user_id = p_user_id;

  return v_order_id;
end;
$$;

revoke all on function create_order_with_stock(uuid, jsonb, numeric, jsonb, text, bigint) from public;
-- Only edge functions (service_role) should call this; do NOT grant to authenticated.

-- Rate limiting buckets: per (key, endpoint) sliding-window counter.
-- Edge functions call check_rate_limit() before doing expensive work.
create table if not exists rate_limit_buckets (
  bucket_key text not null,
  endpoint text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (bucket_key, endpoint, window_start)
);

-- Returns true when the request is allowed, false when it's rate-limited.
-- Uses a fixed-size window (e.g. 60 seconds) and a max count.
create or replace function check_rate_limit(
  p_key text,
  p_endpoint text,
  p_window_seconds int default 60,
  p_max int default 10
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_window timestamptz;
  v_count int;
begin
  v_window := date_trunc('second', now()) - (extract(epoch from now())::bigint % p_window_seconds) * interval '1 second';

  insert into rate_limit_buckets (bucket_key, endpoint, window_start, count)
  values (p_key, p_endpoint, v_window, 1)
  on conflict (bucket_key, endpoint, window_start)
  do update set count = rate_limit_buckets.count + 1
  returning count into v_count;

  -- Garbage collect old windows occasionally
  if random() < 0.01 then
    delete from rate_limit_buckets where window_start < now() - interval '1 hour';
  end if;

  return v_count <= p_max;
end;
$$;

revoke all on function check_rate_limit(text, text, int, int) from public;
-- service_role only

-- DPDP Act 2023: data deletion requests. Users can request account erasure;
-- admins fulfill within 30 days per the law. Self-service deletion for
-- auth.users requires service-role, so we capture the intent here.
create table if not exists data_deletion_requests (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  email text not null,
  reason text,
  status text default 'pending' check (status in ('pending','processing','completed','rejected')),
  requested_at timestamptz default now(),
  resolved_at timestamptz,
  unique (user_id)
);

alter table data_deletion_requests enable row level security;

drop policy if exists "Users create own deletion request" on data_deletion_requests;
create policy "Users create own deletion request"
  on data_deletion_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own deletion request" on data_deletion_requests;
create policy "Users read own deletion request"
  on data_deletion_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Admins manage deletion requests" on data_deletion_requests;
create policy "Admins manage deletion requests"
  on data_deletion_requests for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

-- Error log: append-only crash/error reporting from clients and edge functions
create table if not exists error_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz default now(),
  source text,
  user_id uuid,
  message text,
  stack text,
  context jsonb,
  url text,
  user_agent text
);

alter table error_logs enable row level security;

drop policy if exists "Anyone can insert error logs" on error_logs;
create policy "Anyone can insert error logs"
  on error_logs for insert
  with check (true);

drop policy if exists "Admins read error logs" on error_logs;
create policy "Admins read error logs"
  on error_logs for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

