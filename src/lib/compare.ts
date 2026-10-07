// Head-to-head brand comparisons (/compare/fiji-water-vs-evian).
//
// "X vs Y" is one of the most common bottled-water searches. Each popular brand
// is represented by its flagship (most-viewed) product, and pairs follow the
// popularity order in POPULAR_BRAND_SLUGS so every pair has one canonical slug.

import type { Water } from '@/types';
import { getBrand, ingredients } from '@/lib/data';
import { flagshipWater, POPULAR_BRAND_SLUGS, PREMIUM_BRAND_SLUGS } from '@/lib/rankings';

/** How many of the popular brands get pairwise pages (n*(n-1)/2 pages). */
const COMPARE_BRAND_COUNT = 24;

export type Comparison = {
  slug: string;
  a: Water;
  b: Water;
  aBrand: string;
  bBrand: string;
};

const brandLabel = (w: Water) => (w.brandSlug && getBrand(w.brandSlug)?.name) || w.brandName || w.name;

function build(): Comparison[] {
  const flagships = [...POPULAR_BRAND_SLUGS.slice(0, COMPARE_BRAND_COUNT), ...PREMIUM_BRAND_SLUGS.slice(0, 4)]
    .map((slug) => ({ slug, water: flagshipWater(slug) }))
    .filter((x): x is { slug: string; water: Water } => Boolean(x.water));
  const out: Comparison[] = [];
  for (let i = 0; i < flagships.length; i += 1) {
    for (let j = i + 1; j < flagships.length; j += 1) {
      const a = flagships[i];
      const b = flagships[j];
      out.push({
        slug: `${a.slug}-vs-${b.slug}`,
        a: a.water,
        b: b.water,
        aBrand: brandLabel(a.water),
        bBrand: brandLabel(b.water),
      });
    }
  }
  return out;
}

export const COMPARISONS = build().map((c) => ({ ...c, a: { ...c.a, brandName: c.aBrand }, b: { ...c.b, brandName: c.bBrand } }));

export const getComparison = (slug: string) => COMPARISONS.find((c) => c.slug === slug);

/** "evian-vs-fiji-water" → the canonical "fiji-water-vs-evian" if it exists. */
export function reversedComparison(slug: string) {
  const [x, y] = slug.split('-vs-');
  if (!x || !y) return undefined;
  return getComparison(`${y}-vs-${x}`);
}

export const comparisonsFor = (brandSlug: string) =>
  COMPARISONS.filter((c) => c.a.brandSlug === brandSlug || c.b.brandSlug === brandSlug);

export function contaminantCount(w: Water) {
  return w.ingredients.filter((ref) => ref.is_contaminant || ingredients[ref.ingredient_id]?.is_contaminant).length;
}
