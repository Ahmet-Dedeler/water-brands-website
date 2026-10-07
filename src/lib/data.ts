import watersData from '@/data/waters.json';
import waterCardsData from '@/data/water-cards.json';
import waterFiltersData from '@/data/water-filters.json';
import waterFilterCardsData from '@/data/water-filter-cards.json';
import ingredientsData from '@/data/ingredients.json';
import brandsData from '@/data/brands.json';
import labsData from '@/data/labs.json';
import tapWaterCardsData from '@/data/tap-water-cards.json';
import type {
  Brand,
  IngredientDetail,
  IngredientsMap,
  LabDetail,
  LabsMap,
  TapWaterCard,
  Water,
  WaterCard,
  WaterFilter,
  WaterFilterCard,
} from '@/types';
import { siteUrl } from '@/lib/site';

export { siteUrl };

/**
 * Upstream brand names have stray whitespace and some are all lowercase
 * ("saratoga spring water"). Single-word lowercase names are real brand
 * styling ("bubly", "smartwater") and are kept.
 */
export function cleanBrandName<T extends string | null>(name: T): T {
  if (!name) return name;
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (trimmed === trimmed.toLowerCase() && trimmed.includes(' ')) {
    return trimmed.replace(/\b\w/g, (c) => c.toUpperCase()) as T;
  }
  return trimmed as T;
}

const withCleanBrand = <T extends { brandName: string | null }>(rows: T[]) =>
  rows.map((row) => ({ ...row, brandName: cleanBrandName(row.brandName) }));

export const waters = withCleanBrand(watersData as Water[]);
export const waterCards = withCleanBrand(waterCardsData as WaterCard[]);
export const waterFilters = withCleanBrand(waterFiltersData as WaterFilter[]);
export const waterFilterCards = withCleanBrand(waterFilterCardsData as WaterFilterCard[]);
export const ingredients = ingredientsData as IngredientsMap;
export const ingredientList = Object.values(ingredients) as IngredientDetail[];
export const ingredientSearchCards = ingredientList.map((ingredient) => ({
  id: ingredient.id,
  name: ingredient.name,
  category: ingredient.category,
  is_contaminant: ingredient.is_contaminant,
}));
export const brands = (brandsData as Brand[]).map((b) => ({ ...b, name: cleanBrandName(b.name) }));
export const labs = labsData as LabsMap;
export const tapWaterCards = tapWaterCardsData as TapWaterCard[];

export const getWater = (id: string) => waters.find((w) => w.id.toString() === id);
export const getWaterFilter = (id: string) => waterFilters.find((f) => f.id.toString() === id);
export const getIngredient = (id: string) => ingredients[id];
export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
export const getLab = (id: number | null): LabDetail | null => {
  if (id == null) return null;
  return labs[id.toString()] ?? null;
};

