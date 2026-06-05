import type { MetadataRoute } from 'next';
import { ingredientList, siteUrl, waterCards } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...waterCards.map((w) => ({
      url: `${siteUrl}/water/${w.id}`,
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
