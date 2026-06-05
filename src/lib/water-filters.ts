import type { CapSafety, PackagingFilter, WaterCard, WaterRankingFilters, WaterSourceFilter } from '@/types';

export const EMPTY_FILTERS: WaterRankingFilters = {
  labTestedOnly: false,
  noMicroplastics: false,
  capSafety: null,
  packaging: null,
  waterSource: null,
};

export const PACKAGING_OPTIONS: { value: PackagingFilter; label: string; emoji: string }[] = [
  { value: 'plastic', label: 'Plastic', emoji: '🥤' },
  { value: 'glass', label: 'Glass', emoji: '🫙' },
  { value: 'cardboard', label: 'Cardboard', emoji: '📦' },
  { value: 'aluminum', label: 'Aluminum', emoji: '🔩' },
  { value: 'aluminum (can)', label: 'Aluminum (can)', emoji: '🥫' },
];

export const SOURCE_OPTIONS: { value: WaterSourceFilter; label: string; emoji: string }[] = [
  { value: 'municipal_supply', label: 'Municipal', emoji: '🏙️' },
  { value: 'mountain_spring', label: 'Mtn spring', emoji: '⛰️' },
  { value: 'spring', label: 'Spring', emoji: '💧' },
  { value: 'well', label: 'Well', emoji: '🕳️' },
  { value: 'aquifer', label: 'Aquifer', emoji: '🪨' },
  { value: 'iceberg', label: 'Iceberg', emoji: '🧊' },
  { value: 'rain', label: 'Rain', emoji: '🌧️' },
  { value: 'unknown', label: 'Unknown', emoji: '❓' },
];

export const CAP_SAFETY_OPTIONS: { value: CapSafety; label: string; emoji: string }[] = [
  { value: 'low', label: 'Low risk', emoji: '✅' },
  { value: 'moderate', label: 'Moderate risk', emoji: '⚠️' },
  { value: 'high', label: 'Leaching', emoji: '☣️' },
];

export function countActiveFilters(filters: WaterRankingFilters): number {
  let count = 0;
  if (filters.labTestedOnly) count++;
  if (filters.noMicroplastics) count++;
  if (filters.capSafety) count++;
  if (filters.packaging) count++;
  if (filters.waterSource) count++;
  return count;
}

/** Client-side filter logic aligned with Oasis bottled-water ranking filters. */
export function matchesRankingFilters(water: WaterCard, filters: WaterRankingFilters): boolean {
  if (filters.labTestedOnly && !water.hasLabTest) return false;
  if (filters.noMicroplastics && !water.noMicroplastics) return false;
  if (filters.capSafety && water.capSafety !== filters.capSafety) return false;
  if (filters.packaging && water.packaging !== filters.packaging) return false;
  if (filters.waterSource && water.waterSource !== filters.waterSource) return false;
  return true;
}
