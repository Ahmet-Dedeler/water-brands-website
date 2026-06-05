import watersData from '@/data/waters.json';
import waterCardsData from '@/data/water-cards.json';
import type { Water, WaterCard } from '@/types';

export const waters = watersData as Water[];
export const waterCards = waterCardsData as WaterCard[];

export const getWater = (id: string) => waters.find((w) => w.id.toString() === id);

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://water-brands-website.vercel.app';
