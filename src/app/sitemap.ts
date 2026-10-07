import type { MetadataRoute } from "next";
import { RANKINGS } from "@/lib/rankings";
import { COMPARISONS } from "@/lib/compare";
import { GUIDES } from "@/lib/guides";
import {
  brands,
  ingredientList,
  siteUrl,
  tapWaterCards,
  waterCards,
  waters,
  waterFilterCards,
} from "@/lib/data";

// Keep the sitemap useful for search engines without publishing a complete
// machine-readable inventory of every scraped/detail URL on the site.
const MAX_SITEMAP_WATERS = 1200;
const MAX_SITEMAP_FILTERS = 250;
const MAX_SITEMAP_INGREDIENTS = 300;
const MAX_SITEMAP_BRANDS = 600;
const MAX_SITEMAP_TAP_WATER = 250;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Popular products first (what people search for), then top scorers.
  const byViews = waters.toSorted((a, b) => b.views - a.views).slice(0, MAX_SITEMAP_WATERS / 2);
  const byScore = waterCards.toSorted((a, b) => b.score - a.score).slice(0, MAX_SITEMAP_WATERS);
  const sitemapWaters = [...new Map([...byViews, ...byScore].map((w) => [w.id, w])).values()].slice(0, MAX_SITEMAP_WATERS);
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
      url: `${siteUrl}/best`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...RANKINGS.map((r) => ({
      url: `${siteUrl}/best/${r.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    {
      url: `${siteUrl}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...GUIDES.map((g) => ({
      url: `${siteUrl}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...COMPARISONS.map((c) => ({
      url: `${siteUrl}/compare/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
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
