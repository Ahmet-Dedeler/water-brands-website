import type { CapSafety, PackagingFilter, WaterCard, WaterRankingFilters, WaterSourceFilter } from '@/types';

export const EMPTY_FILTERS: WaterRankingFilters = {
  labTestedOnly: false,
  noMicroplastics: false,
  capSafety: null,
  packaging: null,
  waterSource: null,
};

export const PACKAGING_OPTIONS: { value: PackagingFilter; label: string }[] = [
  { value: 'plastic', label: 'Plastic' },
  { value: 'glass', label: 'Glass' },
  { value: 'cardboard', label: 'Cardboard' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'aluminum (can)', label: 'Aluminum (can)' },
];

export const SOURCE_OPTIONS: { value: WaterSourceFilter; label: string }[] = [
  { value: 'municipal_supply', label: 'Municipal' },
  { value: 'mountain_spring', label: 'Mtn spring' },
  { value: 'spring', label: 'Spring' },
  { value: 'well', label: 'Well' },
  { value: 'aquifer', label: 'Aquifer' },
  { value: 'iceberg', label: 'Iceberg' },
  { value: 'rain', label: 'Rain' },
  { value: 'unknown', label: 'Unknown' },
];

export const CAP_SAFETY_OPTIONS: { value: CapSafety; label: string }[] = [
  { value: 'low', label: 'Low risk' },
  { value: 'moderate', label: 'Moderate risk' },
  { value: 'high', label: 'Leaching' },
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
