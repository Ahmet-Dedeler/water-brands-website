import 'server-only';

import idIndex from '@/data/tap-water/id-index.json';
import type { TapWater } from '@/types';

const tapWaterIndex = idIndex as Record<string, string>;

export async function getTapWaterById(id: string): Promise<TapWater | null> {
  const stateKey = tapWaterIndex[id];
  if (!stateKey) return null;
  const mod = await import(`@/data/tap-water/${stateKey}.json`);
  const list = mod.default as TapWater[];
  return list.find((row) => row.id.toString() === id) ?? null;
}
