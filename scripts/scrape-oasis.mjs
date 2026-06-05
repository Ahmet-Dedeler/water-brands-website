import { createWriteStream } from 'node:fs';
import { mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';

const SUPABASE_URL = 'https://connect.live-oasis.com';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_I9h6Pl639oJuC1uMSuqxGw_fnbXxpCA';
const OASIS_ORIGIN = 'https://www.oasishealth.app';
const OUTPUT_ROOT = path.join(process.cwd(), 'data', 'oasis');

const PAGE_SIZE = 1000;
const IMAGE_AUDIT_CONCURRENCY = 24;
const IMAGE_REQUEST_TIMEOUT_MS = 12000;

const args = new Set(process.argv.slice(2));
const includeTapWater = args.has('--include-tap-water');
const auditImages = !args.has('--skip-image-audit');
const dumpRawHugeTables = args.has('--dump-raw-huge-tables');

function restHeaders(extra = {}) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    ...extra,
  };
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}\n${text.slice(0, 1000)}`);
  }
  return text;
}

async function fetchJson(url, options = {}) {
  return JSON.parse(await fetchText(url, options));
}

function buildRestUrl(table, query) {
  return `${SUPABASE_REST_URL}/${table}?${query}`;
}

async function fetchAll(table, query, { label = table } = {}) {
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const url = buildRestUrl(table, query);
    const page = await fetchJson(url, {
      headers: restHeaders({ Range: `${from}-${to}` }),
    });

    rows.push(...page);
    process.stdout.write(`\r${label}: ${rows.length.toLocaleString()} rows`);

    if (page.length < PAGE_SIZE) break;
  }

  process.stdout.write('\n');
  return rows;
}

async function fetchByIds(table, ids, { label = table, order = 'id.asc' } = {}) {
  const idList = Array.isArray(ids) ? ids : [...ids];
  const uniqueIds = [...new Set(idList.filter((id) => id !== null && id !== undefined))]
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id))
    .sort((a, b) => a - b);

  if (uniqueIds.length === 0) return [];

  const rows = [];
  const chunkSize = 500;
  for (let index = 0; index < uniqueIds.length; index += chunkSize) {
    const chunk = uniqueIds.slice(index, index + chunkSize);
    const query = `select=*&id=in.(${chunk.join(',')})&order=${order}`;
    rows.push(...await fetchAll(table, query, {
      label: `${label} ${index + chunk.length}/${uniqueIds.length}`,
    }));
  }

  const byId = new Map(rows.map((row) => [row.id, row]));
  return uniqueIds.map((id) => byId.get(id)).filter(Boolean);
}

function collectProductReferences(products) {
  const refs = {
    brands: new Set(),
    companies: new Set(),
    ingredients: new Set(),
    stores: new Set(),
    countries: new Set(),
    certs: new Set(),
    labs: new Set(),
    recalls: new Set(),
  };

  for (const product of products) {
    if (product.brand) refs.brands.add(product.brand);
    if (product.company) refs.companies.add(product.company);
    if (product.current_lab_id) refs.labs.add(product.current_lab_id);
    if (product.recall_id) refs.recalls.add(product.recall_id);

    for (const storeId of Array.isArray(product.stores) ? product.stores : []) refs.stores.add(storeId);
    for (const countryId of Array.isArray(product.countries) ? product.countries : []) refs.countries.add(countryId);
    for (const certId of Array.isArray(product.cert_ids) ? product.cert_ids : []) refs.certs.add(certId);

    for (const ingredient of Array.isArray(product.ingredients) ? product.ingredients : []) {
      if (ingredient?.ingredient_id) refs.ingredients.add(ingredient.ingredient_id);
      if (ingredient?.id) refs.ingredients.add(ingredient.id);
    }
  }

  return refs;
}

function normalizeImageUrls(product) {
  return {
    ...product,
    image_urls: {
      primary: product.transparent_image || product.image || null,
      transparent: product.transparent_image || null,
      original: product.image || null,
    },
  };
}

function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    const value = row[key] ?? 'null';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  await Promise.all(Array.from({ length: concurrency }, async () => {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) return;
      results[index] = await mapper(values[index], index);
    }
  }));

  return results;
}

async function checkUrl(url) {
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_REQUEST_TIMEOUT_MS);

    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
      await response.body?.cancel?.();
    }

    clearTimeout(timeout);
    return {
      ok: response.ok,
      status: response.status,
      content_type: response.headers.get('content-type'),
      final_url: response.url,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function auditProductImages(products) {
  const imageRows = products
    .map((product) => ({
      table: product.__source_table,
      id: product.id,
      name: product.name,
      image: product.image || null,
      transparent_image: product.transparent_image || null,
      primary: product.transparent_image || product.image || null,
    }))
    .filter((row) => row.primary);

  let completed = 0;
  return mapWithConcurrency(imageRows, IMAGE_AUDIT_CONCURRENCY, async (row) => {
    const audited = {
      ...row,
      primary_status: await checkUrl(row.primary),
      original_status: row.image && row.image !== row.primary ? await checkUrl(row.image) : null,
      transparent_status: row.transparent_image && row.transparent_image !== row.primary
        ? await checkUrl(row.transparent_image)
        : null,
    };

    completed += 1;
    process.stdout.write(`\rimage audit: ${completed.toLocaleString()}/${imageRows.length.toLocaleString()}`);
    return audited;
  }).finally(() => process.stdout.write('\n'));
}

function extractStringsAroundTerms(source, terms) {
  const quotedStrings = [...source.matchAll(/"((?:[^"\\]|\\.){20,500})"/g)]
    .map((match) => {
      try {
        return JSON.parse(`"${match[1]}"`);
      } catch {
        return null;
      }
    })
    .filter((value) => typeof value === 'string');

  const seen = new Set();
  return quotedStrings.filter((value) => {
    const lower = value.toLowerCase();
    const matched = terms.some((term) => lower.includes(term));
    if (!matched || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

async function scrapeUiNotes() {
  const topRatedHtml = await fetchText(`${OASIS_ORIGIN}/top-rated/bottled_water`);
  const webpackMatch = topRatedHtml.match(/\/_next\/static\/chunks\/webpack-[^"]+\.js/);
  if (!webpackMatch) return { error: 'Could not find webpack chunk in top-rated HTML.' };

  const webpackSource = await fetchText(new URL(webpackMatch[0], OASIS_ORIGIN).href);
  const chunkHashMatch = webpackSource.match(/6252:"([^"]+)"/);
  if (!chunkHashMatch) return { error: 'Could not find MicroplasticsModal chunk hash.' };

  const microplasticsChunkUrl = `${OASIS_ORIGIN}/_next/static/chunks/6252.${chunkHashMatch[1]}.js`;
  const microplasticsSource = await fetchText(microplasticsChunkUrl);

  return {
    microplastics: {
      chunk_url: microplasticsChunkUrl,
      extracted_strings: extractStringsAroundTerms(microplasticsSource, [
        'microplastic',
        'plastic bottle',
        'beverage',
        'nanoplastic',
      ]),
    },
  };
}

async function writeJson(outputDir, filename, data) {
  const filePath = path.join(outputDir, filename);

  if (!Array.isArray(data)) {
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
    return;
  }

  const stream = createWriteStream(filePath, { encoding: 'utf8' });
  stream.write('[\n');

  for (let index = 0; index < data.length; index += 1) {
    const prefix = index === 0 ? '  ' : ',\n  ';
    if (!stream.write(`${prefix}${JSON.stringify(data[index])}`)) {
      await once(stream, 'drain');
    }
  }

  stream.end('\n]\n');
  await once(stream, 'finish');
}

async function replaceLatestSymlink(outputDir) {
  const latestPath = path.join(OUTPUT_ROOT, 'latest');
  await rm(latestPath, { force: true, recursive: true });

  try {
    await symlink(outputDir, latestPath, 'dir');
  } catch {
    // Some filesystems dislike symlinks; fall back to a text pointer.
    await writeFile(path.join(OUTPUT_ROOT, 'LATEST.txt'), `${outputDir}\n`);
  }
}

async function main() {
  const startedAt = new Date();
  const outputDir = path.join(OUTPUT_ROOT, startedAt.toISOString().replace(/[:.]/g, '-'));
  await mkdir(outputDir, { recursive: true });

  const categories = await fetchAll('categories', 'select=*&order=priority.asc.nullslast,id.asc', {
    label: 'categories',
  });

  const items = (await fetchAll(
    'items',
    'select=*&lifecycle_status=eq.verified&order=score.desc.nullslast,id.asc',
    { label: 'verified items' },
  )).map((row) => normalizeImageUrls({ ...row, __source_table: 'items' }));

  const waterFilters = (await fetchAll(
    'water_filters',
    'select=*&order=score.desc.nullslast,id.asc',
    { label: 'water filters' },
  )).map((row) => normalizeImageUrls({ ...row, __source_table: 'water_filters' }));

  const airFilters = (await fetchAll(
    'air_filters',
    'select=*&order=score.desc.nullslast,id.asc',
    { label: 'air filters' },
  )).map((row) => normalizeImageUrls({ ...row, __source_table: 'air_filters' }));

  const tapWaterLocations = includeTapWater
    ? await fetchAll('tap_water_locations', 'select=*&order=score.desc.nullslast,id.asc', {
      label: 'tap water locations',
    })
    : [];

  const productRows = [...items, ...waterFilters, ...airFilters];
  const refs = collectProductReferences(productRows);

  const ingredients = await fetchByIds('ingredients', refs.ingredients, { label: 'ingredients' });
  const brands = await fetchByIds('brands', refs.brands, { label: 'brands' });
  const companies = await fetchByIds('companies', refs.companies, { label: 'companies' });
  const stores = await fetchByIds('stores', refs.stores, { label: 'stores' });
  const countries = await fetchByIds('countries', refs.countries, { label: 'countries' });
  const certs = await fetchByIds('certs', refs.certs, { label: 'certs' });
  const labs = await fetchByIds('labs', refs.labs, { label: 'labs' });
  const recalls = await fetchByIds('recalls', refs.recalls, { label: 'recalls' });
  const materials = await fetchAll('materials', 'select=*&order=id.asc', { label: 'materials' });
  const testKits = await fetchAll('test_kits', 'select=*&order=id.asc', { label: 'test kits' });
  const uiNotes = await scrapeUiNotes();

  const imageAudit = auditImages ? await auditProductImages(productRows) : [];

  if (dumpRawHugeTables) {
    await writeJson(outputDir, 'raw_huge_table_note.json', {
      warning: 'Raw huge table dumping is intentionally not enabled in this script body. Use filtered verified products unless you intentionally need hundreds of thousands of inventory rows.',
      observed_counts: {
        items: 583088,
        ingredients: 166736,
        brands: 102543,
        companies: 84491,
      },
    });
  }

  const manifest = {
    scraped_at: startedAt.toISOString(),
    source: {
      website: OASIS_ORIGIN,
      supabase_url: SUPABASE_URL,
      top_rated_seed_url: `${OASIS_ORIGIN}/top-rated/bottled_water`,
      product_filter: 'items.lifecycle_status = verified',
      include_tap_water: includeTapWater,
      image_audit: auditImages,
    },
    counts: {
      categories: categories.length,
      verified_items: items.length,
      water_filters: waterFilters.length,
      air_filters: airFilters.length,
      tap_water_locations: tapWaterLocations.length,
      ingredients_referenced: ingredients.length,
      brands_referenced: brands.length,
      companies_referenced: companies.length,
      stores_referenced: stores.length,
      countries_referenced: countries.length,
      certs_referenced: certs.length,
      labs_referenced: labs.length,
      recalls_referenced: recalls.length,
      materials: materials.length,
      test_kits: testKits.length,
      image_audit_rows: imageAudit.length,
    },
    item_type_counts: countBy(items, 'type'),
    water_filter_type_counts: countBy(waterFilters, 'type'),
    air_filter_type_counts: countBy(airFilters, 'type'),
    output_files: [
      'manifest.json',
      'categories.json',
      'items_verified.json',
      'water_filters.json',
      'air_filters.json',
      includeTapWater ? 'tap_water_locations.json' : null,
      'ingredients_referenced.json',
      'brands_referenced.json',
      'companies_referenced.json',
      'stores_referenced.json',
      'countries_referenced.json',
      'certs_referenced.json',
      'labs_referenced.json',
      'recalls_referenced.json',
      'materials.json',
      'test_kits.json',
      'ui_notes.json',
      auditImages ? 'image_audit.json' : null,
    ].filter(Boolean),
  };

  await writeJson(outputDir, 'manifest.json', manifest);
  await writeJson(outputDir, 'categories.json', categories);
  await writeJson(outputDir, 'items_verified.json', items);
  await writeJson(outputDir, 'water_filters.json', waterFilters);
  await writeJson(outputDir, 'air_filters.json', airFilters);
  if (includeTapWater) await writeJson(outputDir, 'tap_water_locations.json', tapWaterLocations);
  await writeJson(outputDir, 'ingredients_referenced.json', ingredients);
  await writeJson(outputDir, 'brands_referenced.json', brands);
  await writeJson(outputDir, 'companies_referenced.json', companies);
  await writeJson(outputDir, 'stores_referenced.json', stores);
  await writeJson(outputDir, 'countries_referenced.json', countries);
  await writeJson(outputDir, 'certs_referenced.json', certs);
  await writeJson(outputDir, 'labs_referenced.json', labs);
  await writeJson(outputDir, 'recalls_referenced.json', recalls);
  await writeJson(outputDir, 'materials.json', materials);
  await writeJson(outputDir, 'test_kits.json', testKits);
  await writeJson(outputDir, 'ui_notes.json', uiNotes);
  if (auditImages) await writeJson(outputDir, 'image_audit.json', imageAudit);

  await replaceLatestSymlink(outputDir);

  console.log(JSON.stringify({
    outputDir,
    latest: path.join(OUTPUT_ROOT, 'latest'),
    counts: manifest.counts,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
