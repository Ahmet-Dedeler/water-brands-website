// Shapes for the slim site dataset produced by scripts/build-site-data.mjs.

export type WaterType =
  | 'bottled_water'
  | 'sparkling_water'
  | 'water_gallon'
  | 'flavored_water';

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
  hasLabReport: boolean;
}

export interface IngredientDetail {
  name: string;
  description: string | null;
  benefits: string | null;
  risks: string | null;
  is_contaminant: boolean;
  measure: string | null;
  legal_limit: number | null;
  health_guideline: number | null;
}

export interface IngredientsMap {
  [id: string]: IngredientDetail;
}
