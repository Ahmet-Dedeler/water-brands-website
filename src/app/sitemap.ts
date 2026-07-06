import type { MetadataRoute } from "next";
import {
  brands,
  ingredientList,
  siteUrl,
  tapWaterCards,
  waterCards,
  waterFilterCards,
} from "@/lib/data";

// Keep the sitemap useful for search engines without publishing a complete
// machine-readable inventory of every scraped/detail URL on the site.
const MAX_SITEMAP_WATERS = 500;
const MAX_SITEMAP_FILTERS = 250;
const MAX_SITEMAP_INGREDIENTS = 300;
const MAX_SITEMAP_BRANDS = 300;
const MAX_SITEMAP_TAP_WATER = 250;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const sitemapWaters = waterCards
    .toSorted((a, b) => b.score - a.score)
    .slice(0, MAX_SITEMAP_WATERS);
  const sitemapFilters = waterFilterCards
    .toSorted((a, b) => b.score - a.score)
    .slice(0, MAX_SITEMAP_FILTERS);
  const sitemapIngredients = ingredientList
    .toSorted(
      (a, b) =>
        Number(b.is_contaminant) - Number(a.is_contaminant) ||
        b.severity_score - a.severity_score,
    )
    .slice(0, MAX_SITEMAP_INGREDIENTS);
  const sitemapBrands = brands
    .toSorted((a, b) => b.productCount - a.productCount)
    .slice(0, MAX_SITEMAP_BRANDS);
  const sitemapTapWater = tapWaterCards
    .toSorted((a, b) => (b.score ?? -1) - (a.score ?? -1))
    .slice(0, MAX_SITEMAP_TAP_WATER);

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/filter`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/scoring`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/scoring/water-filters`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/ingredients`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/tap-water`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...sitemapWaters.map((w) => ({
      url: `${siteUrl}/water/${w.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...sitemapFilters.map((f) => ({
      url: `${siteUrl}/filter/${f.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...sitemapIngredients.map((ingredient) => ({
      url: `${siteUrl}/ingredient/${ingredient.id}`,
      lastModified: ingredient.updated_at
        ? new Date(ingredient.updated_at)
        : now,
      changeFrequency: "monthly" as const,
      priority: ingredient.is_contaminant ? 0.65 : 0.55,
    })),
    ...sitemapBrands.map((brand) => ({
      url: `${siteUrl}/brand/${brand.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...sitemapTapWater.map((location) => ({
      url: `${siteUrl}/tap-water/${location.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
