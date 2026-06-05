import watersData from '@/data/waters.json';
import waterCardsData from '@/data/water-cards.json';
import waterFiltersData from '@/data/water-filters.json';
import waterFilterCardsData from '@/data/water-filter-cards.json';
import ingredientsData from '@/data/ingredients.json';
import type {
  IngredientDetail,
  IngredientsMap,
  Water,
  WaterCard,
  WaterFilter,
  WaterFilterCard,
} from '@/types';

export const waters = watersData as Water[];
export const waterCards = waterCardsData as WaterCard[];
export const waterFilters = waterFiltersData as WaterFilter[];
export const waterFilterCards = waterFilterCardsData as WaterFilterCard[];
export const ingredients = ingredientsData as IngredientsMap;
export const ingredientList = Object.values(ingredients) as IngredientDetail[];
export const ingredientSearchCards = ingredientList.map((ingredient) => ({
  id: ingredient.id,
  name: ingredient.name,
  category: ingredient.category,
  is_contaminant: ingredient.is_contaminant,
}));

export const getWater = (id: string) => waters.find((w) => w.id.toString() === id);
export const getWaterFilter = (id: string) => waterFilters.find((f) => f.id.toString() === id);
export const getIngredient = (id: string) => ingredients[id];

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://waterqualityrank.org';
