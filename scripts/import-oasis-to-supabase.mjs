#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OASIS_SOURCE_URL = 'https://connect.live-oasis.com';
const OASIS_SOURCE_REST_URL = `${OASIS_SOURCE_URL}/rest/v1`;
const OASIS_SOURCE_KEY = 'sb_publishable_I9h6Pl639oJuC1uMSuqxGw_fnbXxpCA';

const SUPABASE_URL = process.env.WATER_BRANDS_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.WATER_BRANDS_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATA_DIR = process.env.OASIS_DATA_DIR || path.join(process.cwd(), 'data', 'oasis', 'latest');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Set WATER_BRANDS_SUPABASE_URL and WATER_BRANDS_SUPABASE_SERVICE_ROLE_KEY before importing.');
}

const PAGE_SIZE = 1000;

function readJson(name, fallback = []) {
  const filePath = path.join(DATA_DIR, name);
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(name, data) {
  writeFileSync(path.join(DATA_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

function hashRow(row) {
  return createHash('sha256').update(JSON.stringify(row)).digest('hex');
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function stringOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function uniqueById(rows) {
  return [...new Map(rows.filter((row) => row?.id != null).map((row) => [row.id, row])).values()];
}

async function oasisFetchAll(table, query = 'select=*&order=id.asc') {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const response = await fetch(`${OASIS_SOURCE_REST_URL}/${table}?${query}`, {
      headers: {
        apikey: OASIS_SOURCE_KEY,
        Authorization: `Bearer ${OASIS_SOURCE_KEY}`,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    });
    if (!response.ok) throw new Error(`${response.status} fetching Oasis ${table}: ${await response.text()}`);
    const page = await response.json();
    rows.push(...page);
    process.stdout.write(`\rsource ${table}: ${rows.length.toLocaleString()} rows`);
    if (page.length < PAGE_SIZE) break;
  }
  process.stdout.write('\n');
  return rows;
}

async function rest(method, table, { query = '', body } = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${method} ${table} failed: ${response.status} ${await response.text()}`);
  }
}

async function upsert(table, rows, { chunkSize = 500 } = {}) {
  if (!rows.length) return;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await rest('POST', table, { body: chunk });
    process.stdout.write(`\r${table}: ${Math.min(index + chunk.length, rows.length).toLocaleString()}/${rows.length.toLocaleString()}`);
  }
  process.stdout.write('\n');
}

async function deleteIn(table, column, values, { chunkSize = 500 } = {}) {
  const uniqueValues = [...new Set(values.filter((value) => value !== null && value !== undefined))];
  for (let index = 0; index < uniqueValues.length; index += chunkSize) {
    const chunk = uniqueValues.slice(index, index + chunkSize);
    await rest('DELETE', table, { query: `${column}=in.(${chunk.join(',')})` });
  }
}

function mapItem(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    type: row.type ?? null,
    score: numberOrNull(row.score),
    brand_oasis_id: numberOrNull(row.brand),
    company_oasis_id: numberOrNull(row.company),
    lifecycle_status: row.lifecycle_status ?? null,
    status: row.status ?? null,
    image: row.image ?? null,
    transparent_image: row.transparent_image ?? null,
    packaging: row.packaging ?? null,
    cap_material: Array.isArray(row.cap_material) ? row.cap_material.join(', ') : row.cap_material ?? null,
    water_source: row.water_source ?? null,
    metadata: objectOrEmpty(row.metadata),
    score_breakdown: arrayOrEmpty(row.score_breakdown),
    sources: arrayOrEmpty(row.sources),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapIngredient(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    category: row.category ?? null,
    is_contaminant: row.is_contaminant ?? null,
    severity_score: numberOrNull(row.severity_score),
    bonus_score: numberOrNull(row.bonus_score),
    measure: row.measure ?? null,
    legal_limit: numberOrNull(row.legal_limit),
    health_guideline: numberOrNull(row.health_guideline),
    image: row.image ?? null,
    sources: arrayOrEmpty(row.sources),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapNutrient(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    unit: row.unit ?? null,
    benefits: row.benefits ?? null,
    risks: row.risks ?? null,
    sources: arrayOrEmpty(row.sources),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapBrand(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    company_oasis_id: numberOrNull(row.company),
    slug: row.slug ?? null,
    image: row.image ?? null,
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapCompany(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    image: row.image ?? null,
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapCategory(row) {
  return {
    oasis_id: row.id,
    ref: row.ref ?? null,
    label: row.label ?? null,
    parent: row.parent ?? null,
    table_name: row.table ?? null,
    db_types: row.db_types ?? null,
    score_category: row.score_category ?? null,
    status: row.status ?? null,
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapLab(row) {
  return {
    oasis_id: row.id,
    product_oasis_id: numberOrNull(row.product),
    product_table: row.product_table ?? null,
    product_name: row.product_name ?? null,
    lab_name: row.lab_name ?? null,
    report_url: row.report_url ?? null,
    sample_date: row.sample_date ?? null,
    parsed_data: objectOrEmpty(row.parsed_data),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapMaterial(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    category: row.category ?? null,
    is_microplastic_risk: row.is_microplastic_risk ?? null,
    is_skin_irritant: row.is_skin_irritant ?? null,
    severity_score: numberOrNull(row.severity_score),
    bonus_score: numberOrNull(row.bonus_score),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapWaterFilter(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    type: row.type ?? null,
    score: numberOrNull(row.score),
    brand_oasis_id: numberOrNull(row.brand),
    company_oasis_id: numberOrNull(row.company),
    image: row.image ?? null,
    transparent_image: row.transparent_image ?? null,
    technologies: arrayOrEmpty(row.technologies),
    filtered_contaminant_categories: arrayOrEmpty(row.filtered_contaminant_categories),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapAirFilter(row) {
  return {
    oasis_id: row.id,
    name: row.name || `Unnamed air filter ${row.id}`,
    score: numberOrNull(row.score),
    brand_oasis_id: numberOrNull(row.brand),
    company_oasis_id: numberOrNull(row.company),
    image: row.image ?? null,
    transparent_image: row.transparent_image ?? null,
    technologies: arrayOrEmpty(row.technologies),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapTestKit(row) {
  return {
    oasis_id: row.id,
    name: row.name,
    product_type: row.product_type ?? null,
    price: numberOrNull(row.price),
    retail_price: numberOrNull(row.retail_price),
    ingredients: arrayOrEmpty(row.ingredients),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapTapWaterLocation(row) {
  return {
    oasis_id: row.id,
    name: stringOrNull(row.name),
    score: numberOrNull(row.score),
    raw: row,
    row_hash: hashRow(row),
    last_seen_at: new Date().toISOString(),
  };
}

function mapItemIngredients(items) {
  const rows = [];
  const seen = new Set();
  for (const item of items) {
    for (const ingredient of arrayOrEmpty(item.ingredients)) {
      const ingredientId = numberOrNull(ingredient?.ingredient_id ?? ingredient?.id);
      if (!ingredientId) continue;
      const key = `${item.id}:${ingredientId}:${JSON.stringify(ingredient)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        item_oasis_id: item.id,
        ingredient_oasis_id: ingredientId,
        amount: numberOrNull(ingredient.amount),
        measure: ingredient.measure ?? null,
        is_contaminant: ingredient.is_contaminant ?? null,
        is_beneficial: ingredient.is_beneficial ?? null,
        raw: ingredient,
      });
    }
  }
  return rows;
}

function mapItemNutrients(items) {
  const rows = [];
  for (const item of items) {
    arrayOrEmpty(item.nutrients).forEach((nutrient, index) => {
      if (!nutrient || !Object.values(nutrient).some((value) => value !== null && value !== '' && value !== 0)) return;
      rows.push({
        item_oasis_id: item.id,
        nutrient_oasis_id: numberOrNull(nutrient.nutrient_id ?? nutrient.id),
        name: nutrient.name ?? null,
        amount: nutrient.amount == null ? null : String(nutrient.amount),
        unit: nutrient.unit ?? null,
        raw: nutrient,
        row_index: index,
      });
    });
  }
  return rows;
}

async function main() {
  const manifest = readJson('manifest.json', {});
  const scrapedAt = manifest.scraped_at || new Date().toISOString();

  let nutrients = readJson('nutrients.json', null);
  if (!nutrients) {
    nutrients = await oasisFetchAll('nutrients');
    writeJson('nutrients.json', nutrients);
  }

  const items = uniqueById([
    ...readJson('items_verified.json'),
    ...readJson('items_water_all.json'),
  ]);

  await upsert('scrape_runs', [{
    source: 'oasis',
    scraped_at: scrapedAt,
    source_url: OASIS_SOURCE_URL,
    manifest,
  }]);

  await upsert('oasis_companies', uniqueById(readJson('companies_referenced.json')).map(mapCompany));
  await upsert('oasis_brands', uniqueById(readJson('brands_referenced.json')).map(mapBrand));
  await upsert('oasis_categories', uniqueById(readJson('categories.json')).map(mapCategory));
  await upsert('oasis_ingredients', uniqueById(readJson('ingredients_referenced.json')).map(mapIngredient));
  await upsert('oasis_nutrients', uniqueById(nutrients).map(mapNutrient));
  await upsert('oasis_items', items.map(mapItem));

  const itemIds = items.map((item) => item.id);
  await deleteIn('oasis_item_ingredients', 'item_oasis_id', itemIds);
  await deleteIn('oasis_item_nutrients', 'item_oasis_id', itemIds);
  await upsert('oasis_item_ingredients', mapItemIngredients(items), { chunkSize: 400 });
  await upsert('oasis_item_nutrients', mapItemNutrients(items), { chunkSize: 400 });

  await upsert('oasis_labs', uniqueById(readJson('labs_referenced.json')).map(mapLab));
  await upsert('oasis_materials', uniqueById(readJson('materials.json')).map(mapMaterial));
  await upsert('oasis_water_filters', uniqueById(readJson('water_filters.json')).map(mapWaterFilter));
  await upsert('oasis_air_filters', uniqueById(readJson('air_filters.json')).map(mapAirFilter));
  await upsert('oasis_test_kits', uniqueById(readJson('test_kits.json')).map(mapTestKit));
  await upsert('oasis_tap_water_locations', uniqueById(readJson('tap_water_locations.json')).map(mapTapWaterLocation));

  console.log('Done importing Oasis data to Supabase.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
