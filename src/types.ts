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

export interface LabContaminant {
  name: string;
  amount: number;
  measure: string | null;
  status: string | null;
}

export interface LabDetail {
  id: number;
  laboratory: string | null;
  reportDate: string | null;
  sampleDate: string | null;
  methodology: string | null;
  reportNumber: string | null;
  sampleDescription: string | null;
  status: string | null;
  contaminants: LabContaminant[];
}

export interface LabsMap {
  [id: string]: LabDetail;
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  companyName: string | null;
  waterCount: number;
  filterCount: number;
  productCount: number;
}

export interface TapWaterUtility {
  name: string;
  score: number | null;
  zipCodes: string | null;
  totalContaminants: number;
  contaminantsExceedingGuidelines: number;
  contaminants: { ingredient_id: number; amount: number | null }[];
}

export interface TapWater {
  id: number;
  name: string;
  score: number | null;
  image: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  utilities: TapWaterUtility[];
  sources: Source[];
}

export interface TapWaterCard {
  id: number;
  name: string;
  score: number | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  utilityCount: number;
  contaminantCount: number;
  exceedingGuidelines: number;
}

export interface Water {
  id: number;
  name: string;
  type: WaterType;
  score: number;
  brandId: number | null;
  brandSlug: string | null;
  brandName: string | null;
  companyName: string | null;
  description: string | null;
  image: string | null;
  rawImage: string | null;
  packaging: string | null;
  capMaterial: string | null;
  waterSource: string | null;
  hasLabTest: boolean;
  labId: number | null;
  labReports: Source[];
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
  brandSlug: string | null;
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

export interface IngredientSearchCard {
  id: number;
  name: string;
  category: string | null;
  is_contaminant: boolean;
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
  brandId: number | null;
  brandSlug: string | null;
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
  labId: number | null;
  labReports: Source[];
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
  brandSlug: string | null;
  image: string | null;
  technologies: string[];
  hasLabTest: boolean;
  certificationCount: number;
  categoryCount: number;
}
