-- =============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Adds Blog, Baristas, and Barista Access tables
-- =============================================

-- 1. BLOG POSTS
create table if not exists blog_posts (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  cover_image text,
  content text,
  author_name text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists blog_posts_published_idx on blog_posts (published, created_at desc);

alter table blog_posts enable row level security;

drop policy if exists "Anyone can read published blog posts" on blog_posts;
drop policy if exists "Admins can read all blog posts"       on blog_posts;
drop policy if exists "Admins can insert blog posts"         on blog_posts;
drop policy if exists "Admins can update blog posts"         on blog_posts;
drop policy if exists "Admins can delete blog posts"         on blog_posts;

create policy "Anyone can read published blog posts"
  on blog_posts for select using (published = true);

create policy "Admins can read all blog posts"
  on blog_posts for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can insert blog posts"
  on blog_posts for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update blog posts"
  on blog_posts for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete blog posts"
  on blog_posts for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 2. BARISTA ACCESS (paid pass for viewing baristas list)
create table if not exists barista_access (
  user_id uuid references auth.users on delete cascade primary key,
  payment_id text,
  amount integer,
  paid_at timestamptz default now()
);

alter table barista_access enable row level security;

drop policy if exists "Users see own access"   on barista_access;
drop policy if exists "Users insert own access" on barista_access;
drop policy if exists "Admins read all access" on barista_access;

create policy "Users see own access"
  on barista_access for select using (auth.uid() = user_id);

create policy "Admins read all access"
  on barista_access for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users insert own access"
  on barista_access for insert with check (auth.uid() = user_id);

-- 3. BARISTAS (CV-style submissions from baristas)
create table if not exists baristas (
  id bigint generated always as identity primary key,
  full_name text not null,
  phone text not null,
  email text,
  experience_years integer default 0,
  experience_summary text,
  education text,
  skills text,
  current_location text,
  photo_url text,
  approved boolean default false,
  created_at timestamptz default now()
);

create index if not exists baristas_approved_idx on baristas (approved, created_at desc);

alter table baristas enable row level security;

drop policy if exists "Anyone can submit a barista"          on baristas;
drop policy if exists "Paid users can read approved baristas" on baristas;
drop policy if exists "Admins can read all baristas"          on baristas;
drop policy if exists "Admins can update baristas"            on baristas;
drop policy if exists "Admins can delete baristas"            on baristas;

create policy "Anyone can submit a barista"
  on baristas for insert with check (true);

create policy "Paid users can read approved baristas"
  on baristas for select using (
    approved = true
    and exists (select 1 from barista_access where user_id = auth.uid())
  );

create policy "Admins can read all baristas"
  on baristas for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update baristas"
  on baristas for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete baristas"
  on baristas for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
