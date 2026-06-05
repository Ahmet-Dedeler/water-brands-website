create extension if not exists pgcrypto;

create table if not exists public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'oasis',
  scraped_at timestamptz not null,
  source_url text,
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.oasis_items (
  oasis_id bigint primary key,
  name text not null,
  type text,
  score numeric,
  brand_oasis_id bigint,
  company_oasis_id bigint,
  lifecycle_status text,
  status text,
  image text,
  transparent_image text,
  packaging text,
  cap_material text,
  water_source text,
  metadata jsonb not null default '{}'::jsonb,
  score_breakdown jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_ingredients (
  oasis_id bigint primary key,
  name text not null,
  category text,
  is_contaminant boolean,
  severity_score numeric,
  bonus_score numeric,
  measure text,
  legal_limit numeric,
  health_guideline numeric,
  image text,
  sources jsonb not null default '[]'::jsonb,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_nutrients (
  oasis_id bigint primary key,
  name text not null,
  unit text,
  benefits text,
  risks text,
  sources jsonb not null default '[]'::jsonb,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_item_ingredients (
  item_oasis_id bigint not null references public.oasis_items(oasis_id) on delete cascade,
  ingredient_oasis_id bigint not null,
  amount numeric,
  measure text,
  is_contaminant boolean,
  is_beneficial boolean,
  raw jsonb not null,
  primary key (item_oasis_id, ingredient_oasis_id, raw)
);

create table if not exists public.oasis_item_nutrients (
  item_oasis_id bigint not null references public.oasis_items(oasis_id) on delete cascade,
  nutrient_oasis_id bigint,
  name text,
  amount text,
  unit text,
  raw jsonb not null,
  row_index integer not null,
  primary key (item_oasis_id, row_index)
);

create table if not exists public.oasis_brands (
  oasis_id bigint primary key,
  name text not null,
  company_oasis_id bigint,
  slug text,
  image text,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_companies (
  oasis_id bigint primary key,
  name text not null,
  image text,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_categories (
  oasis_id bigint primary key,
  ref text,
  label text,
  parent text,
  table_name text,
  db_types jsonb,
  score_category text,
  status text,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_labs (
  oasis_id bigint primary key,
  product_oasis_id bigint,
  product_table text,
  product_name text,
  lab_name text,
  report_url text,
  sample_date timestamptz,
  parsed_data jsonb not null default '{}'::jsonb,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_materials (
  oasis_id bigint primary key,
  name text not null,
  category text,
  is_microplastic_risk boolean,
  is_skin_irritant boolean,
  severity_score numeric,
  bonus_score numeric,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_water_filters (
  oasis_id bigint primary key,
  name text not null,
  type text,
  score numeric,
  brand_oasis_id bigint,
  company_oasis_id bigint,
  image text,
  transparent_image text,
  technologies jsonb not null default '[]'::jsonb,
  filtered_contaminant_categories jsonb not null default '[]'::jsonb,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_air_filters (
  oasis_id bigint primary key,
  name text not null,
  score numeric,
  brand_oasis_id bigint,
  company_oasis_id bigint,
  image text,
  transparent_image text,
  technologies jsonb not null default '[]'::jsonb,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_test_kits (
  oasis_id bigint primary key,
  name text not null,
  product_type text,
  price integer,
  retail_price integer,
  ingredients jsonb not null default '[]'::jsonb,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.oasis_tap_water_locations (
  oasis_id bigint primary key,
  name text,
  score numeric,
  raw jsonb not null,
  row_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists oasis_items_type_idx on public.oasis_items(type);
create index if not exists oasis_items_score_idx on public.oasis_items(score desc nulls last);
create index if not exists oasis_items_brand_idx on public.oasis_items(brand_oasis_id);
create index if not exists oasis_items_company_idx on public.oasis_items(company_oasis_id);
create index if not exists oasis_ingredients_category_idx on public.oasis_ingredients(category);
create index if not exists oasis_ingredients_contaminant_idx on public.oasis_ingredients(is_contaminant);
create index if not exists oasis_item_ingredients_ingredient_idx on public.oasis_item_ingredients(ingredient_oasis_id);
create index if not exists oasis_item_nutrients_nutrient_idx on public.oasis_item_nutrients(nutrient_oasis_id);
create index if not exists oasis_labs_product_idx on public.oasis_labs(product_table, product_oasis_id);

alter table public.scrape_runs enable row level security;
alter table public.oasis_items enable row level security;
alter table public.oasis_ingredients enable row level security;
alter table public.oasis_nutrients enable row level security;
alter table public.oasis_item_ingredients enable row level security;
alter table public.oasis_item_nutrients enable row level security;
alter table public.oasis_brands enable row level security;
alter table public.oasis_companies enable row level security;
alter table public.oasis_categories enable row level security;
alter table public.oasis_labs enable row level security;
alter table public.oasis_materials enable row level security;
alter table public.oasis_water_filters enable row level security;
alter table public.oasis_air_filters enable row level security;
alter table public.oasis_test_kits enable row level security;
alter table public.oasis_tap_water_locations enable row level security;
