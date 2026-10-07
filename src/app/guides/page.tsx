import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { pageMetadata } from '@/lib/metadata';
import { GUIDES } from '@/lib/guides';
import { Breadcrumbs, breadcrumbLd, JsonLd } from '@/components/seo';

const title = 'Water Guides: Microplastics, PFAS, Glass vs Plastic & More';
const description =
  'Plain-English guides to drinking water, backed by lab data: the healthiest bottled water, microplastics, PFAS, spring vs purified water, alkaline water and tap water.';

export const metadata: Metadata = {
  ...pageMetadata({ title, description, path: '/guides' }),
  title: { absolute: title },
};

export default function GuidesHub() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd data={breadcrumbLd([{ name: 'Guides', path: '/guides' }])} />
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <Breadcrumbs crumbs={[{ name: 'Guides', path: '/guides' }]} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          <span aria-hidden="true">📚 </span>Water guides
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
          Straight answers to the questions people actually ask about drinking water, with numbers from our lab-data rankings.
        </p>
        <ul className="mt-8 space-y-3">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <span aria-hidden="true">{g.emoji} </span>
                  {g.h1}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
