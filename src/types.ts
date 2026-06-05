// Shapes for the slim site dataset produced by scripts/build-site-data.mjs.

export type WaterType =
  | 'bottled_water'
  | 'sparkling_water'
  | 'water_gallon'
  | 'flavored_water'
  | 'hydrogen_water';

export interface WaterIngredientRef {
  ingredient_id: number;
  amount: number | null;
  measure: string | null;
  is_contaminant: boolean | null;
  is_beneficial: boolean | null;
}

export interface ScoreBreakdownItem {
  id: string;
  label: string;
  score: number;
  max: number | null;
  description: string | null;
}

export interface Source {
  url: string;
  label: string;
}

export type CapSafety = 'low' | 'moderate' | 'high';

export type PackagingFilter = 'plastic' | 'glass' | 'cardboard' | 'aluminum' | 'aluminum (can)';

export type WaterSourceFilter =
  | 'municipal_supply'
  | 'mountain_spring'
  | 'spring'
  | 'well'
  | 'aquifer'
  | 'iceberg'
  | 'rain'
  | 'unknown';

export interface WaterRankingFilters {
  labTestedOnly: boolean;
  noMicroplastics: boolean;
  capSafety: CapSafety | null;
  packaging: PackagingFilter | null;
  waterSource: WaterSourceFilter | null;
}

export interface Water {
  id: number;
  name: string;
  type: WaterType;
  score: number;
  brandName: string | null;
  companyName: string | null;
  description: string | null;
  image: string | null;
  rawImage: string | null;
  packaging: string | null;
  capMaterial: string | null;
  waterSource: string | null;
  hasLabTest: boolean;
  noMicroplastics: boolean;
  capSafety: CapSafety | null;
  isDistilled: boolean;
  filtrationMethods: string[];
  ph: number | null;
  tds: number | null;
  fluoride: number | null;
  pfas: string | null;
  isPfasTested: boolean;
  isMicroplasticsTested: boolean;
  views: number;
  ingredients: WaterIngredientRef[];
  scoreBreakdown: ScoreBreakdownItem[];
  sources: Source[];
}

// The lightweight projection the leaderboard cards need (keeps the homepage
// payload small even though we have ~2k products).
export interface WaterCard {
  id: number;
  name: string;
  type: WaterType;
  score: number;
  brandName: string | null;
  image: string | null;
  packaging: string | null;
  waterSource: string | null;
  /** Lab report indexed in Oasis score breakdown. */
  hasLabReport: boolean;
  /** Oasis “Lab tested only” — product has a linked lab (`current_lab_id`). */
  hasLabTest: boolean;
  /** Packaging certified no plastic (Oasis “No microplastics”). */
  noMicroplastics: boolean;
  capSafety: CapSafety | null;
}

export interface IngredientDetail {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  image: string | null;
  benefits: string | null;
  risks: string | null;
  is_contaminant: boolean;
  severity_score: number;
  bonus_score: number;
  measure: string | null;
  legal_limit: number | null;
  health_guideline: number | null;
  measure_food: string | null;
  legal_limit_food: number | null;
  health_guideline_food: number | null;
  sources: Source[];
  updated_at: string | null;
}

export interface IngredientsMap {
  [id: string]: IngredientDetail;
}

export type WaterFilterType =
  | 'filter'
  | 'sink_filter'
  | 'shower_filter'
  | 'bottle_filter'
  | 'home_filter';

export interface FilteredContaminantCategory {
  category: string;
  percentage: number | null;
  status: string | null;
}

export interface WaterFilter {
  id: number;
  name: string;
  type: WaterFilterType;
  score: number;
  brandName: string | null;
  companyName: string | null;
  description: string | null;
  image: string | null;
  rawImage: string | null;
  technologies: string[];
  certifications: string[];
  filteredContaminantCategories: FilteredContaminantCategory[];
  tags: string | null;
  price: number | null;
  lifeSpan: string | null;
  hasLabTest: boolean;
  affiliateUrl: string | null;
  views: number;
  scoreBreakdown: ScoreBreakdownItem[];
  sources: Source[];
}

export interface WaterFilterCard {
  id: number;
  name: string;
  type: WaterFilterType;
  score: number;
  brandName: string | null;
  image: string | null;
  technologies: string[];
  hasLabTest: boolean;
  certificationCount: number;
  categoryCount: number;
}
