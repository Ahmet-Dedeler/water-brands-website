import type { MetadataRoute } from 'next';
import { ingredientList, siteUrl, waterCards, waterFilterCards } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/filter`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/scoring`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/scoring/water-filters`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    ...waterCards.map((w) => ({
      url: `${siteUrl}/water/${w.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...waterFilterCards.map((f) => ({
      url: `${siteUrl}/filter/${f.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...ingredientList.map((ingredient) => ({
      url: `${siteUrl}/ingredient/${ingredient.id}`,
      lastModified: ingredient.updated_at ? new Date(ingredient.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: ingredient.is_contaminant ? 0.65 : 0.55,
    })),
  ];
}
