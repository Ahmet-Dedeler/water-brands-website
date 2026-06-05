#!/usr/bin/env node
// Distills the large Oasis scrape (data/oasis/latest) into the slim JSON the
// site actually ships under src/data/.
//
// Usage: npm run build:data   (or: node scripts/build-site-data.mjs)

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OASIS = join(ROOT, 'data', 'oasis', 'latest');
const OUT = join(ROOT, 'src', 'data');

const WATER_TYPES = new Set([
  'bottled_water',
  'sparkling_water',
  'water_gallon',
  'flavored_water',
  'hydrogen_water',
]);

const LAB_SOURCE_RE = /report|analysis|lab|\.pdf/i;

const readJson = (name) => JSON.parse(readFileSync(join(OASIS, name), 'utf8'));
const readJsonIfPresent = (name, fallback) => {
  try {
    return readJson(name);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    return fallback;
  }
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function findTapWaterFile() {
  const latestFile = join(OASIS, 'tap_water_locations.json');
  if (existsSync(latestFile)) return latestFile;

  const dataRoot = join(ROOT, 'data', 'oasis');
  const candidates = readdirSync(dataRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(dataRoot, entry.name, 'tap_water_locations.json'))
    .filter((filePath) => existsSync(filePath))
    .sort()
    .reverse();

  return candidates[0] ?? null;
}

function extractLabReports(sources) {
  return (sources || [])
    .filter((s) => s?.url && (LAB_SOURCE_RE.test(s.url) || LAB_SOURCE_RE.test(s.label || s.name || '')))
    .map((s) => ({ url: s.url, label: s.label || s.name || s.url }));
}

function mapLab(lab) {
  const meta = lab.parsed_data?.metadata || {};
  const contaminants = (lab.parsed_data?.contaminants || [])
    .filter((c) => c.status === 'detected' && c.amount != null)
    .slice(0, 25)
    .map((c) => ({
      name: c.name,
      amount: c.amount,
      measure: c.measure ?? null,
      status: c.status ?? null,
    }));

  return {
    id: lab.id,
    laboratory: meta.laboratory ?? null,
    reportDate: meta.report_date ?? null,
    sampleDate: meta.sample_date ?? lab.sample_date ?? null,
    methodology: meta.methodology ?? null,
    reportNumber: meta.report_number ?? null,
    sampleDescription: meta.sample_description ?? null,
    status: lab.status ?? null,
    contaminants,
  };
}

function stateSlug(state) {
  if (!state) return 'unknown';
  return slugify(state);
}

function mapTapWater(row) {
  const utilities = (row.utilities || []).map((utility) => ({
    name: utility.name ?? '',
    score: utility.score ?? null,
    zipCodes: utility.zip_codes ?? null,
    totalContaminants: utility.total_contaminants ?? 0,
    contaminantsExceedingGuidelines: utility.contaminants_exceeding_guidelines ?? 0,
    contaminants: (utility.contaminants || [])
      .filter((c) => c && c.ingredient_id != null)
      .map((c) => ({
        ingredient_id: c.ingredient_id,
        amount: c.amount ?? null,
      })),
  }));

  return {
    id: row.id,
    name: row.name,
    score: row.score ?? null,
    image: row.image ?? null,
    state: row.state ?? null,
    country: row.country ?? null,
    zipCode: row.zip_code ?? null,
    utilities,
    sources: (row.sources || [])
      .filter((s) => s && (s.url || s.name))
      .map((s) => ({ url: s.url, label: s.label || s.name || s.url })),
  };
}

function mapTapWaterCard(row) {
  const utilities = row.utilities || [];
  const contaminantCount = utilities.reduce(
    (sum, utility) => sum + (utility.total_contaminants ?? utility.contaminants?.length ?? 0),
    0
  );
  const exceeding = utilities.reduce(
    (sum, utility) => sum + (utility.contaminants_exceeding_guidelines ?? 0),
    0
  );

  return {
    id: row.id,
    name: row.name,
    score: row.score ?? null,
    state: row.state ?? null,
    country: row.country ?? null,
    zipCode: row.zip_code ?? null,
    utilityCount: utilities.length,
    contaminantCount,
    exceedingGuidelines: exceeding,
  };
}

async function streamTapWater(filePath, onRow) {
  const jq = spawn('jq', ['-c', '.[]', filePath], { stdio: ['ignore', 'pipe', 'inherit'] });
  const jqDone = new Promise((resolve, reject) => {
    jq.on('error', reject);
    jq.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`jq exited with code ${code}`));
    });
  });

  const lines = createInterface({ input: jq.stdout, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    onRow(JSON.parse(line));
  }
  await jqDone;
}

const verifiedItems = readJson('items_verified.json');
const items = readJsonIfPresent('items_water_all.json', verifiedItems);
const rawWaterFilters = readJsonIfPresent('water_filters.json', []);
const brands = readJson('brands_referenced.json');
const companies = readJson('companies_referenced.json');
const ingredients = readJson('ingredients_referenced.json');
const rawLabs = readJsonIfPresent('labs_referenced.json', []);

const brandById = new Map(brands.map((b) => [b.id, b]));
const companyById = new Map(companies.map((c) => [c.id, c]));
const ingredientById = new Map(ingredients.map((i) => [i.id, i]));
const labById = new Map(rawLabs.map((l) => [l.id, l]));

const pickImage = (item) => item.transparent_image || item.image || null;

const num = (...vals) => {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
};

const referencedIngredientIds = new Set();
const inlineIngredientById = new Map();

function capDescription(item) {
  const row = (item.score_breakdown || []).find((s) => s.id === 'cap_material');
  return row?.description || item.cap_material || null;
}

function deriveCapSafety(item) {
  const desc = String(capDescription(item) || '').toLowerCase();
  if (desc.includes('leaching')) return 'high';

  const lowCaps = ['aluminum_screw', 'smooth_metal_screw', 'cork', 'metal_twist_off'];
  const rawCap = String(item.cap_material || '').toLowerCase();
  if (lowCaps.some((cap) => desc.includes(cap) || rawCap === cap)) return 'low';
  if (desc && desc !== 'unknown') return 'moderate';
  return null;
}

function hasNoMicroplastics(item) {
  const meta = item.metadata || {};
  if (meta.certified_no_plastic === true || meta.certified_no_plastic === 'true') return true;
  const packDesc = (item.score_breakdown || []).find((s) => s.id === 'packaging')?.description || '';
  return packDesc.toLowerCase().includes('certified no plastic');
}

const waters = items
  .filter((item) => WATER_TYPES.has(item.type) && item.score !== null)
  .map((item) => {
    const meta = item.metadata || {};
    const brand = brandById.get(item.brand);
    const company = companyById.get(item.company);

    const itemIngredients = (item.ingredients || [])
      .filter((ing) => ing && ing.ingredient_id != null)
      .map((ing) => {
        referencedIngredientIds.add(ing.ingredient_id);
        const ref = ingredientById.get(ing.ingredient_id);
        if (!ref && ing.name) inlineIngredientById.set(ing.ingredient_id, ing);
        return {
          ingredient_id: ing.ingredient_id,
          amount: ing.amount ?? null,
          measure: ing.measure ?? ref?.measure ?? null,
          is_contaminant: ing.is_contaminant ?? ref?.is_contaminant ?? null,
          is_beneficial: ing.is_beneficial ?? null,
        };
      });

    const capMaterial = item.cap_material ?? meta.cap_material ?? null;
    const labReports = extractLabReports(item.sources);

    return {
      id: item.id,
      name: item.name,
      type: item.type,
      score: item.score,
      brandId: item.brand ?? null,
      brandName: brand?.name ?? null,
      companyName: company?.name ?? null,
      description: item.description ?? null,
      image: pickImage(item),
      rawImage: item.image ?? null,
      packaging: item.packaging ?? null,
      capMaterial: Array.isArray(capMaterial) ? capMaterial.join(', ') : capMaterial,
      waterSource: item.water_source ?? null,
      hasLabTest: item.current_lab_id != null || labReports.length > 0,
      labId: item.current_lab_id ?? null,
      labReports,
      noMicroplastics: hasNoMicroplastics(item),
      capSafety: deriveCapSafety(item),
      isDistilled: Boolean(item.is_distilled),
      filtrationMethods: item.filtration_methods ?? [],
      ph: num(meta.ph_level, meta.ph),
      tds: num(meta.tds, meta.total_dissolved_solids),
      fluoride: num(meta.fluoride),
      pfas: meta.pfas ?? null,
      isPfasTested: Boolean(item.is_pfas_tested),
      isMicroplasticsTested: Boolean(item.is_microplastics_tested),
      views: item.views ?? 0,
      ingredients: itemIngredients,
      scoreBreakdown: (item.score_breakdown || []).map((b) => ({
        id: b.id,
        label: b.label ?? b.id,
        score: b.score ?? 0,
        max: b.max ?? null,
        description: b.description ?? null,
      })),
      sources: (item.sources || []).filter((s) => s && s.url),
    };
  })
  .sort((a, b) => b.score - a.score || b.views - a.views);

const waterFilters = rawWaterFilters
  .filter((item) => item.score !== null)
  .map((item) => {
    const brand = brandById.get(item.brand);
    const company = companyById.get(item.company);
    const labReports = extractLabReports(item.sources);

    return {
      id: item.id,
      name: item.name,
      type: item.type ?? 'filter',
      score: item.score,
      brandId: item.brand ?? null,
      brandName: brand?.name ?? null,
      companyName: company?.name ?? null,
      description: item.description ?? null,
      image: pickImage(item),
      rawImage: item.image ?? null,
      technologies: item.technologies ?? [],
      certifications: item.certifications ?? [],
      filteredContaminantCategories: (item.filtered_contaminant_categories ?? []).map((c) => ({
        category: c.category ?? '',
        percentage: c.percentage ?? null,
        status: c.status ?? null,
      })),
      tags: item.tags ?? null,
      price: item.price ?? null,
      lifeSpan: item.life_span ?? null,
      hasLabTest: item.current_lab_id != null || labReports.length > 0,
      labId: item.current_lab_id ?? null,
      labReports,
      affiliateUrl: item.affiliate_url ?? null,
      views: item.views ?? 0,
      scoreBreakdown: (item.score_breakdown || []).map((b, idx) => ({
        id: b.id ?? (b.category ? b.category.toLowerCase().replace(/[^a-z0-9]+/g, '_') : `item_${idx}`),
        label: b.label ?? b.category ?? b.id ?? `Score item ${idx + 1}`,
        score: b.score ?? 0,
        max: b.max ?? b.weight ?? null,
        description:
          b.description ??
          (b.effectiveness != null ? `${b.effectiveness}% removal effectiveness` : null),
      })),
      sources: (item.sources || []).filter((s) => s && s.url),
    };
  })
  .sort((a, b) => b.score - a.score || b.views - a.views);

// Brand slugs for active brands (those with at least one ranked product).
const activeBrandIds = new Set();
for (const water of waters) {
  if (water.brandId != null) activeBrandIds.add(water.brandId);
}
for (const filter of waterFilters) {
  if (filter.brandId != null) activeBrandIds.add(filter.brandId);
}

const slugGroups = new Map();
for (const brand of brands) {
  if (!activeBrandIds.has(brand.id)) continue;
  const base = brand.slug || slugify(brand.name);
  if (!slugGroups.has(base)) slugGroups.set(base, []);
  slugGroups.get(base).push(brand.id);
}

const brandSlugById = new Map();
for (const [base, ids] of slugGroups) {
  for (const id of ids) {
    brandSlugById.set(id, ids.length > 1 ? `${base}-${id}` : base);
  }
}

for (const water of waters) {
  water.brandSlug = water.brandId != null ? brandSlugById.get(water.brandId) ?? null : null;
}
for (const filter of waterFilters) {
  filter.brandSlug = filter.brandId != null ? brandSlugById.get(filter.brandId) ?? null : null;
}

const brandRecords = brands
  .filter((brand) => activeBrandIds.has(brand.id))
  .map((brand) => {
    const company = companyById.get(brand.company);
    const waterCount = waters.filter((w) => w.brandId === brand.id).length;
    const filterCount = waterFilters.filter((f) => f.brandId === brand.id).length;
    return {
      id: brand.id,
      slug: brandSlugById.get(brand.id),
      name: brand.name,
      image: brand.image ?? brand.wide_logo ?? null,
      companyName: company?.name ?? null,
      waterCount,
      filterCount,
      productCount: waterCount + filterCount,
    };
  })
  .filter((brand) => brand.slug)
  .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));

// Tap water: stream the huge JSON array and collect ingredient refs.
const tapWaterFile = findTapWaterFile();
const tapWaterCards = [];
const tapWaterByState = new Map();
const tapWaterIdIndex = {};

if (tapWaterFile) {
  await streamTapWater(tapWaterFile, (row) => {
    if (row.score == null) return;
    for (const utility of row.utilities || []) {
      for (const contaminant of utility.contaminants || []) {
        if (contaminant?.ingredient_id != null) referencedIngredientIds.add(contaminant.ingredient_id);
      }
    }
    const mapped = mapTapWater(row);
    const stateKey = stateSlug(mapped.state);
    if (!tapWaterByState.has(stateKey)) tapWaterByState.set(stateKey, []);
    tapWaterByState.get(stateKey).push(mapped);
    tapWaterIdIndex[mapped.id] = stateKey;
    tapWaterCards.push(mapTapWaterCard(row));
  });
  tapWaterCards.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  for (const records of tapWaterByState.values()) {
    records.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }
}

const ingredientMap = {};
for (const id of referencedIngredientIds) {
  const ref = ingredientById.get(id) ?? inlineIngredientById.get(id);
  if (!ref) continue;
  ingredientMap[id] = {
    id: ref.id ?? ref.ingredient_id ?? id,
    name: ref.name ?? '',
    description: ref.description ?? null,
    category: ref.category ?? null,
    image: ref.image ?? null,
    benefits: ref.benefits ?? null,
    risks: ref.risks ?? null,
    is_contaminant: Boolean(ref.is_contaminant),
    severity_score: ref.severity_score ?? 0,
    bonus_score: ref.bonus_score ?? 0,
    measure: ref.measure ?? null,
    legal_limit: ref.legal_limit ?? null,
    health_guideline: ref.health_guideline ?? null,
    measure_food: ref.measure_food ?? null,
    legal_limit_food: ref.legal_limit_food ?? null,
    health_guideline_food: ref.health_guideline_food ?? null,
    sources: (ref.sources || []).filter((s) => s && s.url),
    updated_at: ref.updated_at ?? null,
  };
}

const referencedLabIds = new Set();
for (const water of waters) {
  if (water.labId != null) referencedLabIds.add(water.labId);
}
for (const filter of waterFilters) {
  if (filter.labId != null) referencedLabIds.add(filter.labId);
}

const labsMap = {};
for (const labId of referencedLabIds) {
  const lab = labById.get(labId);
  if (!lab) continue;
  labsMap[labId] = mapLab(lab);
}

const cards = waters.map((w) => ({
  id: w.id,
  name: w.name,
  type: w.type,
  score: w.score,
  brandName: w.brandName,
  brandSlug: w.brandSlug,
  image: w.image,
  packaging: w.packaging,
  waterSource: w.waterSource,
  hasLabReport: w.scoreBreakdown.some((b) => b.id === 'lab_report' && b.score > 0),
  hasLabTest: w.hasLabTest,
  noMicroplastics: w.noMicroplastics,
  capSafety: w.capSafety,
}));

const filterCards = waterFilters.map((f) => ({
  id: f.id,
  name: f.name,
  type: f.type,
  score: f.score,
  brandName: f.brandName,
  brandSlug: f.brandSlug,
  image: f.image,
  technologies: f.technologies.slice(0, 3),
  hasLabTest: f.hasLabTest,
  certificationCount: f.certifications.length,
  categoryCount: f.filteredContaminantCategories.length,
}));

writeFileSync(join(OUT, 'waters.json'), JSON.stringify(waters));
writeFileSync(join(OUT, 'water-cards.json'), JSON.stringify(cards));
writeFileSync(join(OUT, 'ingredients.json'), JSON.stringify(ingredientMap));
writeFileSync(join(OUT, 'water-filters.json'), JSON.stringify(waterFilters));
writeFileSync(join(OUT, 'water-filter-cards.json'), JSON.stringify(filterCards));
writeFileSync(join(OUT, 'brands.json'), JSON.stringify(brandRecords));
writeFileSync(join(OUT, 'labs.json'), JSON.stringify(labsMap));
const tapWaterDir = join(OUT, 'tap-water');
mkdirSync(tapWaterDir, { recursive: true });
writeFileSync(join(OUT, 'tap-water-cards.json'), JSON.stringify(tapWaterCards));
writeFileSync(join(tapWaterDir, 'id-index.json'), JSON.stringify(tapWaterIdIndex));
for (const [stateKey, records] of tapWaterByState) {
  writeFileSync(join(tapWaterDir, `${stateKey}.json`), JSON.stringify(records));
}

const byType = waters.reduce((acc, w) => {
  acc[w.type] = (acc[w.type] || 0) + 1;
  return acc;
}, {});
const filterByType = waterFilters.reduce((acc, f) => {
  acc[f.type] = (acc[f.type] || 0) + 1;
  return acc;
}, {});

console.log(`Wrote ${waters.length} waters to src/data/waters.json`);
console.log(`Wrote ${cards.length} cards to src/data/water-cards.json`);
console.log('  by type:', byType);
console.log(`Wrote ${Object.keys(ingredientMap).length} ingredients to src/data/ingredients.json`);
console.log(`Wrote ${waterFilters.length} filters to src/data/water-filters.json`);
console.log(`Wrote ${filterCards.length} filter cards to src/data/water-filter-cards.json`);
console.log('  filter types:', filterByType);
console.log(`Wrote ${brandRecords.length} brands to src/data/brands.json`);
console.log(`Wrote ${Object.keys(labsMap).length} labs to src/data/labs.json`);
console.log(`Wrote ${tapWaterCards.length} tap water cards to src/data/tap-water-cards.json`);
console.log(`Wrote ${tapWaterByState.size} tap water state files under src/data/tap-water/`);
