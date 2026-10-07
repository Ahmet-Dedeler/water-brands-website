import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { pageMetadata } from '@/lib/metadata';
import { RANKINGS } from '@/lib/rankings';
import { CONTENT_YEAR } from '@/lib/site';
import { Breadcrumbs, breadcrumbLd, JsonLd } from '@/components/seo';
import { COMPARISONS } from '@/lib/compare';

const title = `Best Water Brands & Filters (${CONTENT_YEAR}): Every Ranking`;
const description =
  'Every water ranking in one place: healthiest bottled water, glass, spring, mineral, alkaline and sparkling water, plus the best water filters, pitchers and shower filters.';

export const metadata: Metadata = {
  ...pageMetadata({ title, description, path: '/best' }),
  title: { absolute: title },
};

export default function BestHub() {
  const groups = [
    { heading: 'Bottled water', items: RANKINGS.filter((r) => r.kind === 'water') },
    { heading: 'Water filters', items: RANKINGS.filter((r) => r.kind === 'filter') },
  ];
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd data={breadcrumbLd([{ name: 'Best of', path: '/best' }])} />
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <Breadcrumbs crumbs={[{ name: 'Best of', path: '/best' }]} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          <span aria-hidden="true">🏆 </span>The best waters and filters, by category
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Every list is generated from third-party lab reports and updated with each data refresh. No paid placements.
        </p>

        {groups.map((g) => (
          <section key={g.heading} className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{g.heading}</h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/best/${r.slug}`}
                    className="block h-full rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]"
                  >
                    <span className="text-2xl" aria-hidden="true">{r.emoji}</span>
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">{r.h1}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{r.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            <span aria-hidden="true">⚖️ </span>Head-to-head comparisons
          </h2>
          <ul className="flex flex-wrap gap-2">
            {COMPARISONS.slice(0, 60).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-gray-300 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-200"
                >
                  {c.a.brandName} vs {c.b.brandName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
