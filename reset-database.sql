-- =============================================
-- FULL DATABASE RESET — WIPES ALL DATA + STORAGE
-- Run this in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ⚠️  THIS CANNOT BE UNDONE!
-- =============================================

-- 0. Clear all storage bucket files
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.objects WHERE bucket_id = 'course-videos';
DELETE FROM storage.objects WHERE bucket_id = 'course-thumbnails';

-- 1. Clear all app tables (order matters due to foreign keys)
TRUNCATE TABLE certificates       CASCADE;
TRUNCATE TABLE lesson_progress    CASCADE;
TRUNCATE TABLE lessons            CASCADE;
TRUNCATE TABLE enrollments        CASCADE;
TRUNCATE TABLE cart_items         CASCADE;
TRUNCATE TABLE wishlist           CASCADE;
TRUNCATE TABLE reviews            CASCADE;
TRUNCATE TABLE orders             CASCADE;
TRUNCATE TABLE coupons            CASCADE;
TRUNCATE TABLE courses            CASCADE;
TRUNCATE TABLE products           CASCADE;
TRUNCATE TABLE profiles           CASCADE;

-- 2. Delete ALL auth users (this removes them from auth.users)
-- This requires running as a superuser/service role
DELETE FROM auth.users;

-- 3. Reset auto-increment sequences so IDs start from 1 again
ALTER SEQUENCE IF EXISTS products_id_seq       RESTART WITH 1;
ALTER SEQUENCE IF EXISTS courses_id_seq        RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq         RESTART WITH 1;
ALTER SEQUENCE IF EXISTS enrollments_id_seq    RESTART WITH 1;
ALTER SEQUENCE IF EXISTS reviews_id_seq        RESTART WITH 1;
ALTER SEQUENCE IF EXISTS lessons_id_seq        RESTART WITH 1;
ALTER SEQUENCE IF EXISTS lesson_progress_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS coupons_id_seq        RESTART WITH 1;
ALTER SEQUENCE IF EXISTS wishlist_id_seq       RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cart_items_id_seq     RESTART WITH 1;
ALTER SEQUENCE IF EXISTS certificates_id_seq   RESTART WITH 1;

-- Done! All data has been wiped.
-- You can now sign up fresh and set yourself as admin:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
