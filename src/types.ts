export interface Brand {
    name: string;
}

export interface Ingredient {
    amount: number;
    measure: string;
    ingredient_id: number;
    is_beneficial: boolean | null;
    is_contaminant: boolean | null;
    name?: string;
    risks?: string | null;
    benefits?: string | null;
}

export interface WaterData {
    id: number;
    name: string;
    brand: Brand;
    score: number;
    description: string;
    image: string;
    ingredients: Ingredient[];
    sources: { url: string; label: string }[];
    packaging: string;
    score_breakdown: { id: string; score: number }[];
}

export interface IngredientsMap {
    [key: string]: {
        name: string;
        benefits: string | null;
        risks: string | null;
    };
} 