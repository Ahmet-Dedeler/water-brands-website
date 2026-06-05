import searchIndexData from '@/data/search-index.json';
import type {
  FilterSearchEntry,
  IngredientSearchCard,
  WaterSearchEntry,
} from '@/types';

export const searchWaters = searchIndexData.waters as WaterSearchEntry[];
export const searchFilters = searchIndexData.filters as FilterSearchEntry[];
export const searchIngredients = searchIndexData.ingredients as IngredientSearchCard[];
