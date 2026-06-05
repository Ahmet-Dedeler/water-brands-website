#!/usr/bin/env node
// Distills the large Oasis scrape (data/oasis/latest) into the slim JSON the
// site actually ships: src/data/waters.json + src/data/ingredients.json.
//
// We only keep drinkable-water item types, resolve brand/company IDs to names,
// pick the best image, and flatten the fields the UI renders. Ingredient
// details are emitted as a separate id->details map (only the ingredients that
// are actually referenced), matching how the detail page looks them up.
//
// Usage: npm run build:data   (or: node scripts/build-site-data.mjs)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OASIS = join(ROOT, 'data', 'oasis', 'latest');
const OUT = join(ROOT, 'src', 'data');

// Item types we treat as "water" for the leaderboard.
const WATER_TYPES = new Set([
  'bottled_water',
  'sparkling_water',
  'water_gallon',
  'flavored_water',
]);

const readJson = (name) => JSON.parse(readFileSync(join(OASIS, name), 'utf8'));

const items = readJson('items_verified.json');
const brands = readJson('brands_referenced.json');
const companies = readJson('companies_referenced.json');
const ingredients = readJson('ingredients_referenced.json');

// id -> name lookups
const brandById = new Map(brands.map((b) => [b.id, b]));
const companyById = new Map(companies.map((c) => [c.id, c]));
const ingredientById = new Map(ingredients.map((i) => [i.id, i]));

// Pick the cleanest image: a transparent cutout is nicest on cards, but fall
// back to the raw product photo when there isn't one.
const pickImage = (item) => item.transparent_image || item.image || null;

// metadata holds both `ph` and `ph_level`, `tds` and `total_dissolved_solids`.
const num = (...vals) => {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
};

const referencedIngredientIds = new Set();

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
        return {
          ingredient_id: ing.ingredient_id,
          amount: ing.amount ?? null,
          measure: ing.measure ?? ref?.measure ?? null,
          // Trust the per-item flag when present, else the global ingredient.
          is_contaminant: ing.is_contaminant ?? ref?.is_contaminant ?? null,
          is_beneficial: ing.is_beneficial ?? null,
        };
      });

    const capMaterial = item.cap_material ?? meta.cap_material ?? null;

    return {
      id: item.id,
      name: item.name,
      type: item.type,
      score: item.score,
      brandName: brand?.name ?? null,
      companyName: company?.name ?? null,
      description: item.description ?? null,
      image: pickImage(item),
      rawImage: item.image ?? null,
      packaging: item.packaging ?? null,
      capMaterial: Array.isArray(capMaterial) ? capMaterial.join(', ') : capMaterial,
      waterSource: item.water_source ?? null,
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
  // Highest score first; break ties by popularity so the leaderboard is stable.
  .sort((a, b) => b.score - a.score || b.views - a.views);

// Emit only the ingredient details we actually reference.
const ingredientMap = {};
for (const id of referencedIngredientIds) {
  const ref = ingredientById.get(id);
  if (!ref) continue;
  ingredientMap[id] = {
    name: ref.name ?? '',
    description: ref.description ?? null,
    benefits: ref.benefits ?? null,
    risks: ref.risks ?? null,
    is_contaminant: Boolean(ref.is_contaminant),
    measure: ref.measure ?? null,
    legal_limit: ref.legal_limit ?? null,
    health_guideline: ref.health_guideline ?? null,
  };
}

// Slim card projection for the leaderboard, search and sitemap — keeps client
// payloads ~600 KB instead of shipping the full ~4 MB waters blob everywhere.
const cards = waters.map((w) => ({
  id: w.id,
  name: w.name,
  type: w.type,
  score: w.score,
  brandName: w.brandName,
  image: w.image,
  packaging: w.packaging,
  waterSource: w.waterSource,
  hasLabReport: w.scoreBreakdown.some((b) => b.id === 'lab_report' && b.score > 0),
}));

writeFileSync(join(OUT, 'waters.json'), JSON.stringify(waters));
writeFileSync(join(OUT, 'water-cards.json'), JSON.stringify(cards));
writeFileSync(join(OUT, 'ingredients.json'), JSON.stringify(ingredientMap));

const byType = waters.reduce((acc, w) => {
  acc[w.type] = (acc[w.type] || 0) + 1;
  return acc;
}, {});
console.log(`Wrote ${waters.length} waters to src/data/waters.json`);
console.log(`Wrote ${cards.length} cards to src/data/water-cards.json`);
console.log('  by type:', byType);
console.log(`Wrote ${Object.keys(ingredientMap).length} ingredients to src/data/ingredients.json`);
