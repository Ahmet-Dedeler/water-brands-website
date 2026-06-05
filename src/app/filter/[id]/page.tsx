import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { ScoreBreakdownItem } from '@/types';
import { getLab, getWaterFilter, ingredientSearchCards, siteUrl, waterCards, waterFilterCards } from '@/lib/data';
import Header from '@/components/Header';
import ScoreCircle from '@/components/ScoreCircle';
import { Metadata } from 'next';
import { filterTypeLabel, titleize } from '@/lib/format';
import LabReportsSection from '@/components/LabReportsSection';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const filter = getWaterFilter(id);
  if (!filter) return { title: 'Filter Not Found' };

  const title = `${filter.name} — Score ${filter.score}/100`;
  const description =
    filter.description ||
    `${filter.name}${filter.brandName ? ` by ${filter.brandName}` : ''} scores ${filter.score}/100 for contaminant removal and certifications.`;

  return {
    title,
    description,
    alternates: { canonical: `/filter/${id}` },
    openGraph: {
      title,
      description,
      url: `/filter/${id}`,
      images: filter.image ? [{ url: filter.image, width: 800, height: 600, alt: filter.name }] : [],
    },
  };
}

function Stat({ label, value, tone = 'default' }: { label: string; value: React.ReactNode; tone?: 'default' | 'good' | 'bad' }) {
  const valueColor =
    tone === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'bad'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-gray-900 dark:text-gray-100';
  return (
    <div className="px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</dt>
      <dd className={`text-lg font-semibold mt-0.5 ${valueColor}`}>{value}</dd>
    </div>
  );
}

function ScoreBar({ item }: { item: ScoreBreakdownItem }) {
  const isPenalty = item.id?.endsWith('_penalty') || item.score < 0;
  if (isPenalty) {
    return (
      <li className="flex items-center justify-between py-2.5">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.label}
          {item.description && <span className="text-gray-400 dark:text-gray-500"> · {titleize(item.description)}</span>}
        </span>
        <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{item.score}</span>
      </li>
    );
  }
  const max = item.max ?? Math.max(item.score, 1);
  const pct = Math.max(0, Math.min(100, (item.score / max) * 100));
  return (
    <li className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.label}
          {item.description && <span className="text-gray-400 dark:text-gray-500"> · {titleize(item.description)}</span>}
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {item.score}
          {item.max != null && <span className="text-gray-400 dark:text-gray-500">/{item.max}</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[var(--surface-muted)] overflow-hidden">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

export default async function FilterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const filter = getWaterFilter(id);
  if (!filter) notFound();
  const lab = getLab(filter.labId);

  const chips = [
    filter.tags && titleize(filter.tags),
    filter.lifeSpan && `${filter.lifeSpan} lifespan`,
    filter.price != null && `$${filter.price}`,
  ].filter(Boolean) as string[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: filter.name,
    description: filter.description ?? `${filter.name} water filter score ${filter.score}/100`,
    image: filter.image ?? undefined,
    brand: filter.brandName ? { '@type': 'Brand', name: filter.brandName } : undefined,
    url: `${siteUrl}/filter/${filter.id}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: filter.score,
      bestRating: 100,
      worstRating: 0,
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header waters={waterCards} filters={waterFilterCards} ingredients={ingredientSearchCards} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href="/filter" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 inline-block">
          &larr; Back to all filters
        </Link>

        <div className="bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative flex items-center justify-center bg-gray-50 dark:bg-[var(--surface-muted)]/50 rounded-xl p-4 h-56">
              {filter.image ? (
                <Image
                  src={filter.image}
                  alt={filter.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  className="object-contain p-3"
                  priority
                />
              ) : (
                <span className="text-5xl text-gray-200 dark:text-gray-700" aria-hidden="true">🫖</span>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                {filterTypeLabel(filter.type)}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{filter.name}</h1>
              {filter.brandName && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  by{' '}
                  {filter.brandSlug ? (
                    <Link href={`/brand/${filter.brandSlug}`} className="hover:underline">
                      {filter.brandName}
                    </Link>
                  ) : (
                    filter.brandName
                  )}
                </p>
              )}

              <div className="flex items-center gap-4 mt-4">
                <ScoreCircle score={filter.score} size={80} />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Filter score
                  <div className="text-gray-900 dark:text-gray-100 font-medium">out of 100</div>
                </div>
              </div>

              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {chips.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[var(--surface-muted)] text-gray-600 dark:text-gray-300 text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {filter.affiliateUrl && (
                <a
                  href={filter.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex self-start px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors"
                >
                  View product
                </a>
              )}
            </div>
          </div>

          <dl className="border-t border-gray-100 dark:border-[var(--border-soft)] grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-gray-100 dark:divide-gray-800">
            <Stat label="Lab Tested" value={filter.hasLabTest ? 'Yes' : 'No'} tone={filter.hasLabTest ? 'good' : 'default'} />
            <Stat label="Categories" value={filter.filteredContaminantCategories.length} tone={filter.filteredContaminantCategories.length >= 10 ? 'good' : 'default'} />
            <Stat label="Certifications" value={filter.certifications.length || 'None'} tone={filter.certifications.length ? 'good' : 'default'} />
            <Stat label="Technologies" value={filter.technologies.length} />
          </dl>

          <div className="p-6 md:p-8 space-y-8">
            {filter.description && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">About</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{filter.description}</p>
              </section>
            )}

            {filter.scoreBreakdown.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Score breakdown</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">How this filter earned its {filter.score}/100.</p>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filter.scoreBreakdown.map((item, index) => (
                    <ScoreBar key={item.id ?? index} item={item} />
                  ))}
                </ul>
              </section>
            )}

            <LabReportsSection lab={lab} labReports={filter.labReports} />

            {filter.technologies.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Filtration technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {filter.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-sm">{tech}</span>
                  ))}
                </div>
              </section>
            )}

            {filter.certifications.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {filter.certifications.map((cert) => (
                    <span key={cert} className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-sm">{cert}</span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Contaminant removal</h2>
              <ul className="space-y-2">
                {filter.filteredContaminantCategories.map((cat) => (
                  <li key={cat.category} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[var(--border-soft)] last:border-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{cat.category}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                      {cat.percentage != null ? `${cat.percentage}%` : cat.status ?? '—'}
                    </span>
                  </li>
                ))}
                {filter.filteredContaminantCategories.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No contaminant removal data available.</p>
                )}
              </ul>
            </section>

            {filter.sources.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Sources</h2>
                <ul className="space-y-2">
                  {filter.sources.map((source, index) => (
                    <li key={index}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline break-all text-sm">
                        {source.label || source.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
