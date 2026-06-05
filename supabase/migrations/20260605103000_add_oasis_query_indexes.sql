create index if not exists oasis_water_filters_score_idx
  on public.oasis_water_filters(score desc nulls last);

create index if not exists oasis_air_filters_score_idx
  on public.oasis_air_filters(score desc nulls last);

create index if not exists oasis_tap_water_locations_score_idx
  on public.oasis_tap_water_locations(score desc nulls last);

create index if not exists oasis_tap_water_locations_name_idx
  on public.oasis_tap_water_locations(lower(name));

create index if not exists oasis_nutrients_name_idx
  on public.oasis_nutrients(lower(name));

create index if not exists oasis_brands_name_idx
  on public.oasis_brands(lower(name));

create index if not exists oasis_companies_name_idx
  on public.oasis_companies(lower(name));
