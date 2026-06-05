import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { absoluteUrl, pageMetadata } from '@/lib/metadata';
import {
  brands,
  getBrand,
  waters,
  waterFilters,
} from '@/lib/data';

export async function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return { title: 'Brand Not Found' };

  const title = `${brand.name} — Ranked Waters & Filters`;
  const description = `${brand.name} has ${brand.waterCount} ranked bottled waters and ${brand.filterCount} water filters with lab-tested purity scores on Water Leaderboard.`;

  return pageMetadata({
    title,
    description,
    path: `/brand/${slug}`,
    image: brand.image,
  });
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const brandWaters = waters.filter((w) => w.brandSlug === slug);
  const brandFilters = waterFilters.filter((f) => f.brandSlug === slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    url: absoluteUrl(`/brand/${slug}`),
    logo: brand.image ?? undefined,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href="/" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 inline-block">
          &larr; Back
        </Link>

        <section className="bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            {brand.image ? (
              <Image src={brand.image} alt={brand.name} width={64} height={64} className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-[var(--surface-muted)]" />
            ) : (
              <span className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[var(--surface-muted)] flex items-center justify-center text-2xl">🏷️</span>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{brand.name}</h1>
              {brand.companyName && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{brand.companyName}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {brand.waterCount} waters • {brand.filterCount} filters
              </p>
            </div>
          </div>
        </section>

        {brandWaters.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Waters</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brandWaters.map((water) => (
                <li key={water.id}>
                  <Link href={`/water/${water.id}`} className="flex items-center justify-between p-4 bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-xl hover:shadow-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{water.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{water.score}/100</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {brandFilters.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Filters</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brandFilters.map((filter) => (
                <li key={filter.id}>
                  <Link href={`/filter/${filter.id}`} className="flex items-center justify-between p-4 bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-xl hover:shadow-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{filter.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{filter.score}/100</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
