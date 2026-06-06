import type { TapWaterCard } from '@/types';

/** Canonical Oasis featured tap-water locations (stable IDs, not first ZIP match). */
export const FEATURED_TAP_WATER_IDS = [
  423, // Glen Oaks, NY
  32, // Chicago, IL
  370, // Austin, TX
  4416, // Burney, CA
  94, // Honolulu, HI
  5, // Santa Monica, CA
  963, // Venice, CA
  4774, // Saratoga, CA
  7, // San Francisco, CA
  1572, // Miami, FL
  553, // Dallas, TX
  1072, // Flint, MI
  497, // Denver, CO
  1414, // Happy Valley, OR
  1453, // Detroit, MI
  1464, // Philadelphia, PA
  371, // Washington, DC
  17376, // Brooklyn, NY
  266, // Irvine, CA
  962, // Beverly Hills, CA
] as const;

export function getFeaturedTapWaterCards(locations: TapWaterCard[]): TapWaterCard[] {
  const byId = new Map(locations.map((location) => [location.id, location]));
  return FEATURED_TAP_WATER_IDS.map((id) => byId.get(id)).filter(
    (location): location is TapWaterCard => location != null,
  );
}
