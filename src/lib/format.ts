// Human-readable labels and small derivations shared across the UI.

import type { WaterType } from '@/types';

const TYPE_LABELS: Record<WaterType, string> = {
  bottled_water: 'Still',
  sparkling_water: 'Sparkling',
  water_gallon: 'Gallon',
  flavored_water: 'Flavored',
};

export const waterTypeLabel = (type: WaterType): string => TYPE_LABELS[type] ?? type;

// snake_case enum -> Title Case ("mountain_spring" -> "Mountain Spring").
export const titleize = (value: string | null | undefined): string => {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Score tier drives the accent color across cards, circles and badges.
export type ScoreTier = 'great' | 'good' | 'ok' | 'poor';

export const scoreTier = (score: number): ScoreTier => {
  if (score >= 85) return 'great';
  if (score >= 70) return 'good';
  if (score >= 50) return 'ok';
  return 'poor';
};

export const SCORE_COLORS: Record<ScoreTier, { text: string; stroke: string; bg: string; ring: string }> = {
  great: {
    text: 'text-emerald-600 dark:text-emerald-400',
    stroke: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
  },
  good: {
    text: 'text-lime-600 dark:text-lime-400',
    stroke: 'text-lime-500 dark:text-lime-400',
    bg: 'bg-lime-50 dark:bg-lime-950/50',
    ring: 'ring-lime-200 dark:ring-lime-800',
  },
  ok: {
    text: 'text-amber-600 dark:text-amber-400',
    stroke: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    ring: 'ring-amber-200 dark:ring-amber-800',
  },
  poor: {
    text: 'text-rose-600 dark:text-rose-400',
    stroke: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    ring: 'ring-rose-200 dark:ring-rose-800',
  },
};

// Oasis estimates microplastic likelihood from packaging rather than testing
// every product (see data/oasis/latest/ui_notes.json).
export const microplasticsRisk = (packaging: string | null): 'High' | 'Moderate' | 'Low' => {
  if (!packaging) return 'Moderate';
  const p = packaging.toLowerCase();
  if (p.includes('plastic') || p.includes('polyester') || p.includes('polyethylene')) return 'High';
  if (p.includes('aluminum') || p.includes('can')) return 'Moderate';
  if (p.includes('glass')) return 'Low';
  return 'Moderate';
};
