create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  slug text not null unique,
  model text,
  name text not null,
  category text,
  summary text,
  specs text[] not null default '{}',
  applications text[] not null default '{}',
  benefits text[] not null default '{}',
  image_url text,
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  blocks jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  industry text,
  product_slug text,
  summary text,
  result text,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  country text,
  phone text,
  whatsapp text,
  product_interest text,
  quantity text,
  message text,
  source_page text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'won')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  note text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists products_published_slug_idx on public.products (published, slug);
create index if not exists products_updated_at_idx on public.products (updated_at desc);
create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index if not exists inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id, created_at desc);
create index if not exists pages_published_slug_idx on public.pages (published, slug);

alter table public.admin_profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.pages enable row level security;
alter table public.case_studies enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.site_settings enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.product_categories, public.products, public.pages, public.case_studies, public.site_settings to anon, authenticated;

drop policy if exists "Published product categories are readable" on public.product_categories;
create policy "Published product categories are readable"
  on public.product_categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Published products are readable" on public.products;
create policy "Published products are readable"
  on public.products for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Published pages are readable" on public.pages;
create policy "Published pages are readable"
  on public.pages for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Published case studies are readable" on public.case_studies;
create policy "Published case studies are readable"
  on public.case_studies for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Site settings are readable" on public.site_settings;
create policy "Site settings are readable"
  on public.site_settings for select
  to anon, authenticated
  using (true);

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

insert into public.site_settings (key, value) values
  ('site_name', 'Funel Sensor'),
  ('site_domain', 'https://www.funelsensor.com'),
  ('company_tagline', 'Online water quality analyzers, sensors, and controllers for industrial monitoring projects.'),
  ('contact_email', 'claire23803@gmail.com'),
  ('contact_phone', '+8615606523212'),
  ('contact_whatsapp', '+8615606523212'),
  ('contact_wechat', 'Claire-chujiu')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.pages (slug, title, blocks, seo_title, seo_description, published) values
  ('home', 'Funel Sensor Home', '{}'::jsonb, 'Funel Sensor | Online Water Quality Analyzers', 'Industrial water quality analyzers, sensors, controllers and PLC/SCADA integration for wastewater and process water projects.', true),
  ('products', 'Products', '{}'::jsonb, 'Online Water Quality Analyzer Products', 'Online DO, pH/ORP, conductivity, turbidity, COD, ammonia nitrogen and multi-parameter controller products.', true),
  ('contact', 'Contact', '{}'::jsonb, 'Request Quote | Funel Sensor', 'Request a quotation, datasheet, sample or configuration help for online water quality monitoring projects.', true)
on conflict (slug) do update set
  title = excluded.title,
  blocks = excluded.blocks,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  published = excluded.published,
  updated_at = now();

insert into public.products (
  slug, model, name, category, summary, specs, applications, benefits,
  image_url, seo_title, seo_description, seo_keywords, published
) values
  (
    'online-dissolved-oxygen-analyzer-pfdo-800',
    'PFDO-800',
    'PFDO-800 Online Dissolved Oxygen Analyzer for Wastewater and Aeration Control',
    'Dissolved Oxygen Analyzer',
    'PFDO-800 is an online dissolved oxygen analyzer designed for continuous DO monitoring in wastewater treatment, aeration tanks, aquaculture, and industrial process water.',
    array['Measurement parameter: Dissolved Oxygen', 'Measuring range: 0-20 mg/L', 'Signal output: 4-20 mA / RS485 Modbus', 'Temperature compensation: Automatic temperature compensation', 'Monitoring mode: Continuous online measurement'],
    array['Wastewater aeration tank DO monitoring', 'Municipal wastewater treatment plants', 'Industrial wastewater treatment systems', 'Aquaculture dissolved oxygen monitoring', 'PLC and SCADA water monitoring systems'],
    array['Supports continuous online dissolved oxygen monitoring', 'Helps optimize aeration control and reduce energy cost', 'Suitable for wastewater, aquaculture and industrial water applications', 'Easy integration with PLC and SCADA'],
    null,
    'PFDO-800 Online Dissolved Oxygen Analyzer for Wastewater Aeration Control',
    'PFDO-800 online dissolved oxygen analyzer is designed for continuous DO monitoring in wastewater treatment, aeration control, aquaculture and industrial process water.',
    array['online dissolved oxygen analyzer', 'dissolved oxygen analyzer for wastewater', 'DO analyzer for aeration tank', 'online DO meter'],
    true
  ),
  (
    'ph-orp-online-analyzer',
    'FPH-800',
    'Online pH ORP Analyzer',
    'pH / ORP',
    'Online pH and ORP measurement for dosing, neutralization, wastewater and industrial water.',
    array['pH: 0-14', 'ORP: -2000 to +2000 mV', '4-20mA / RS485 Modbus'],
    array['Wastewater neutralization', 'Industrial process water', 'Chemical dosing control'],
    array['Continuous online measurement', 'PLC and SCADA integration', 'Suitable for dosing systems'],
    null,
    'Online pH ORP Analyzer for Industrial Water Monitoring',
    'Online pH ORP analyzer for wastewater neutralization, chemical dosing and industrial process water monitoring.',
    array['online pH ORP analyzer', 'pH ORP controller', 'wastewater pH monitor'],
    true
  ),
  (
    'conductivity-tds-salinity-analyzer',
    'FCON-800',
    'Conductivity TDS Salinity Analyzer',
    'Conductivity',
    'Online conductivity, TDS and salinity monitoring for RO, boiler, cooling and process water.',
    array['Conductivity / TDS / salinity', 'Temperature compensation', 'RS485 Modbus'],
    array['RO water treatment', 'Boiler water monitoring', 'Cooling water systems'],
    array['Stable online measurement', 'Multiple conductivity ranges', 'Easy system integration'],
    null,
    'Online Conductivity TDS Salinity Analyzer',
    'Online conductivity TDS salinity analyzer for RO, boiler, cooling water and process water monitoring.',
    array['online conductivity analyzer', 'TDS salinity meter', 'conductivity controller'],
    true
  ),
  (
    'turbidity-online-analyzer',
    'FTU-800',
    'Online Turbidity Analyzer',
    'Turbidity',
    'Online turbidity monitoring for waterworks, wastewater discharge and surface water projects.',
    array['Online turbidity monitoring', 'Digital sensor support', 'Continuous water quality control'],
    array['Waterworks', 'Wastewater discharge', 'Surface water monitoring'],
    array['Real-time turbidity monitoring', 'Low maintenance', 'Project configuration support'],
    null,
    'Online Turbidity Analyzer for Water Quality Monitoring',
    'Online turbidity analyzer for waterworks, wastewater discharge and surface water monitoring projects.',
    array['online turbidity analyzer', 'turbidity meter', 'water turbidity sensor'],
    true
  ),
  (
    'mp301-multi-parameter-controller',
    'MP301',
    'Multi-Parameter Water Quality Controller',
    'Controller',
    'Multi-parameter controller for pH, ORP, conductivity, turbidity, DO and integrated stations.',
    array['Multi-channel monitoring', 'RS485 / 4-20mA', 'Cabinet integration'],
    array['Water quality monitoring stations', 'PLC control cabinets', 'Integrated monitoring systems'],
    array['Supports multiple sensors', 'Centralized data management', 'Flexible project integration'],
    null,
    'Multi-Parameter Water Quality Controller',
    'Multi-parameter water quality controller for online analyzers, sensors, control cabinets and monitoring stations.',
    array['multi-parameter water quality controller', 'water quality controller', 'online monitoring station'],
    true
  ),
  (
    'cod-ammonia-nitrogen-analyzer',
    'FCOD-NH3N',
    'COD and Ammonia Nitrogen Analyzer',
    'Nutrient Monitoring',
    'Online COD and ammonia nitrogen analyzer for wastewater discharge and compliance monitoring.',
    array['COD / ammonia nitrogen monitoring', 'Wastewater discharge applications', 'Project configuration support'],
    array['Municipal wastewater', 'Industrial wastewater', 'Compliance monitoring'],
    array['Supports nutrient monitoring', 'Designed for discharge supervision', 'Suitable for integrated stations'],
    null,
    'Online COD and Ammonia Nitrogen Analyzer',
    'Online COD and ammonia nitrogen analyzer for wastewater discharge, compliance monitoring and water quality stations.',
    array['COD analyzer', 'ammonia nitrogen analyzer', 'online nutrient analyzer'],
    true
  )
on conflict (slug) do update set
  model = excluded.model,
  name = excluded.name,
  category = excluded.category,
  summary = excluded.summary,
  specs = excluded.specs,
  applications = excluded.applications,
  benefits = excluded.benefits,
  image_url = excluded.image_url,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  seo_keywords = excluded.seo_keywords,
  published = excluded.published,
  updated_at = now();
