export const funelAdminPolicySql = String.raw`-- Funel Sensor one-time Supabase admin policies
-- Run this once in Supabase SQL Editor for project givzkjmmxmrxcxtlwlys.
-- If the admin email changes, replace claire23803@gmail.com in this file.

create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

insert into public.admin_profiles (user_id, email, role)
select id, email, 'admin'
from auth.users
where email = 'claire23803@gmail.com'
on conflict (user_id) do update set
  email = excluded.email,
  role = 'admin';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant usage on schema public to anon, authenticated;
grant usage on schema storage to anon, authenticated;

grant select on public.product_categories, public.products, public.pages, public.case_studies, public.site_settings to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;

grant select, insert, update, delete on public.admin_profiles to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.pages to authenticated;
grant select, insert, update, delete on public.case_studies to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.inquiry_notes to authenticated;

grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

alter table public.admin_profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.pages enable row level security;
alter table public.case_studies enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.site_settings enable row level security;

-- Admin profile

drop policy if exists "Funel admin can read admin profile" on public.admin_profiles;
create policy "Funel admin can read admin profile"
  on public.admin_profiles for select
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Funel admin can manage admin profile" on public.admin_profiles;
create policy "Funel admin can manage admin profile"
  on public.admin_profiles for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

-- Public reads

drop policy if exists "Published product categories are readable" on public.product_categories;
create policy "Published product categories are readable"
  on public.product_categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Published products are readable" on public.products;
create policy "Published products are readable"
  on public.products for select
  to anon, authenticated
  using (published = true or (select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Published pages are readable" on public.pages;
create policy "Published pages are readable"
  on public.pages for select
  to anon, authenticated
  using (published = true or (select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Published case studies are readable" on public.case_studies;
create policy "Published case studies are readable"
  on public.case_studies for select
  to anon, authenticated
  using (published = true or (select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Site settings are readable" on public.site_settings;
create policy "Site settings are readable"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Admin CMS writes

drop policy if exists "Funel admin can manage categories" on public.product_categories;
create policy "Funel admin can manage categories"
  on public.product_categories for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Funel admin can manage products" on public.products;
create policy "Funel admin can manage products"
  on public.products for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Funel admin can manage pages" on public.pages;
create policy "Funel admin can manage pages"
  on public.pages for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Funel admin can manage cases" on public.case_studies;
create policy "Funel admin can manage cases"
  on public.case_studies for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Funel admin can manage settings" on public.site_settings;
create policy "Funel admin can manage settings"
  on public.site_settings for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

-- Inquiries

drop policy if exists "Anyone can submit inquiry" on public.inquiries;
create policy "Anyone can submit inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Funel admin can manage inquiries" on public.inquiries;
create policy "Funel admin can manage inquiries"
  on public.inquiries for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

drop policy if exists "Funel admin can manage inquiry notes" on public.inquiry_notes;
create policy "Funel admin can manage inquiry notes"
  on public.inquiry_notes for all
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'claire23803@gmail.com');

-- Storage: product image library

drop policy if exists "Funel product images public read" on storage.objects;
create policy "Funel product images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Funel admin can upload product images" on storage.objects;
create policy "Funel admin can upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (select auth.jwt() ->> 'email') = 'claire23803@gmail.com'
  );

drop policy if exists "Funel admin can update product images" on storage.objects;
create policy "Funel admin can update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select auth.jwt() ->> 'email') = 'claire23803@gmail.com'
  )
  with check (
    bucket_id = 'product-images'
    and (select auth.jwt() ->> 'email') = 'claire23803@gmail.com'
  );

drop policy if exists "Funel admin can delete product images" on storage.objects;
create policy "Funel admin can delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select auth.jwt() ->> 'email') = 'claire23803@gmail.com'
  );
`;
