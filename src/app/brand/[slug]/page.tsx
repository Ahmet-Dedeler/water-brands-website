import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { absoluteUrl, pageMetadata } from '@/lib/metadata';
import { CONTENT_YEAR } from '@/lib/site';
import { comparisonsFor } from '@/lib/compare';
import { microplasticsRisk } from '@/lib/format';
import { Breadcrumbs, breadcrumbLd, FaqSection, faqLd, JsonLd } from '@/components/seo';
import {
  brands,
  getBrand,
  waters,
  waterFilters,
} from '@/lib/data';

/** "Fiji Water" stays as-is, "Evian" becomes "Evian water". */
const withWater = (name: string) => (/water$/i.test(name.trim()) ? name.trim() : `${name.trim()} water`);
const withWaterTitle = (name: string) => (/water$/i.test(name.trim()) ? name.trim() : `${name.trim()} Water`);

export async function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return { title: 'Brand Not Found' };

  const best = waters.filter((w) => w.brandSlug === slug).toSorted((a, b) => b.score - a.score)[0];
  const bestFilter = waterFilters.filter((f) => f.brandSlug === slug).toSorted((a, b) => b.score - a.score)[0];
  const isWaterBrand = brand.waterCount > 0;
  const title = isWaterBrand
    ? `Is ${withWaterTitle(brand.name)} Healthy? Lab Test Score (${CONTENT_YEAR})`
    : `${brand.name} Water Filters: Lab-Tested Scores (${CONTENT_YEAR})`;
  const description = isWaterBrand
    ? `${withWater(brand.name)} scores up to ${best?.score ?? '—'}/100 for purity. Compare all ${brand.waterCount} ${brand.name} products on contaminants, pH, source, packaging and microplastics risk.`
    : `${brand.name} has ${brand.filterCount} water filters ranked by verified contaminant removal${bestFilter ? `, led by ${bestFilter.name} (${bestFilter.score}/100)` : ''}.`;

  return {
    ...pageMetadata({ title, description, path: `/brand/${slug}`, image: brand.image }),
    title: { absolute: title },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const brandWaters = waters.filter((w) => w.brandSlug === slug).toSorted((a, b) => b.score - a.score);
  const brandFilters = waterFilters.filter((f) => f.brandSlug === slug).toSorted((a, b) => b.score - a.score);
  const comparisons = comparisonsFor(slug).slice(0, 12);
  const crumbs = [{ name: brand.name, path: `/brand/${slug}` }];

  const best = brandWaters[0];
  const worst = brandWaters.at(-1);
  const faqs = best
    ? [
        {
          q: `Is ${withWater(brand.name)} healthy?`,
          a: `${brand.name}'s best-rated product, ${best.name}, scores ${best.score}/100 for purity${
            best.hasLabTest ? ' with a third-party lab report on file' : ', but has no third-party lab report on file'
          }. Its packaging is ${best.packaging ?? 'not disclosed'} (${microplasticsRisk(best.packaging).toLowerCase()} microplastics risk).`,
        },
        ...(brandWaters.length > 1 && worst
          ? [
              {
                q: `Which ${withWater(brand.name)} is best?`,
                a: `${best.name} is the highest-scoring ${brand.name} product (${best.score}/100). The lowest is ${worst.name} (${worst.score}/100).`,
              },
            ]
          : []),
        {
          q: `Where does ${withWater(brand.name)} come from?`,
          a: best.waterSource && best.waterSource !== 'unknown'
            ? `${best.name} is listed as ${best.waterSource.replace(/_/g, ' ')} water${brand.companyName ? `, produced by ${brand.companyName}` : ''}.`
            : `${brand.name} does not clearly disclose its water source in the data we have.`,
        },
      ]
    : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    url: absoluteUrl(`/brand/${slug}`),
    logo: brand.image ?? undefined,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd data={[jsonLd, breadcrumbLd(crumbs), ...(faqs.length ? [faqLd(faqs)] : [])]} />
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Breadcrumbs crumbs={crumbs} />

        <section className="bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            {brand.image ? (
              <Image src={brand.image} alt={brand.name} width={64} height={64} className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-[var(--surface-muted)]" />
            ) : (
              <span className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[var(--surface-muted)] flex items-center justify-center text-2xl">🏷️</span>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {best ? `Is ${withWater(brand.name)} healthy?` : `${brand.name} water filters`}
              </h1>
              {brand.companyName && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{brand.companyName}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {brand.waterCount} waters • {brand.filterCount} filters
              </p>
            </div>
          </div>
        </section>

        {faqs[0] && <p className="mb-8 max-w-3xl text-lg leading-8 text-gray-700 dark:text-gray-300">{faqs[0].a}</p>}

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
        {comparisons.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Compare {brand.name}</h2>
            <ul className="flex flex-wrap gap-2">
              {comparisons.map((c) => (
                <li key={c.slug}>
                  <Link href={`/compare/${c.slug}`} className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-gray-300 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-200">
                    {c.aBrand} vs {c.bBrand}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="max-w-3xl">
          <FaqSection faqs={faqs} title={`${withWater(brand.name)} FAQ`} />
        </div>
      </div>
    </main>
  );
}
