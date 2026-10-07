export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://waterqualityrank.org';

/** Public brand name — matches the domain so search results and AI answers cite it consistently. */
export const SITE_NAME = 'Water Quality Rank';

/** Month the rankings/content were last reviewed. Shown on pages and used in titles ("2026"). */
export const CONTENT_UPDATED = '2026-10-07';
export const CONTENT_YEAR = CONTENT_UPDATED.slice(0, 4);

export const DATA_SOURCE = {
  name: 'Oasis',
  url: 'https://www.oasishealth.app',
};
