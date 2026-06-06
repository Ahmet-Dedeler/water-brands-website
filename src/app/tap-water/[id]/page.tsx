import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getIngredient } from '@/lib/data';
import { absoluteUrl, pageMetadata } from '@/lib/metadata';
import { getTapWaterById } from '@/lib/tap-water';
import Header from '@/components/Header';
import { scoreTone } from '@/components/TapWaterFeatured';
import TapWaterScorePanel from '@/components/motion/TapWaterScorePanel';
import { motionPress } from '@/lib/ui-classes';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const location = await getTapWaterById(id);
  if (!location) return { title: 'Tap Water Not Found' };

  const place = [location.name, location.state, location.zipCode].filter(Boolean).join(', ');
  const title = `${place} Tap Water Quality`;
  const scorePart = location.score != null ? ` Score ${location.score}/100.` : '';
  const description = `Tap water quality for ${place}: contaminants, utility scores and guideline exceedances.${scorePart}`;

  return pageMetadata({
    title,
    description,
    path: `/tap-water/${id}`,
    image: location.image,
  });
}

const scoreCopy = (score: number | null) => {
  if (score == null) return 'No score available';
  if (score >= 85) return 'Excellent tap water rating';
  if (score >= 70) return 'Good tap water rating';
  if (score >= 50) return 'Mixed tap water rating';
  if (score >= 30) return 'Poor tap water rating';
  return 'High concern tap water rating';
};

const amountLabel = (amount: number | null, measure: string | null | undefined) => {
  if (amount == null) return 'Detected';
  const formatted =
    Math.abs(amount) < 0.001 && amount !== 0
      ? amount.toExponential(2)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(amount);
  return [formatted, measure].filter(Boolean).join(' ');
};

const panelClass =
  'rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]';

export default async function TapWaterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const location = await getTapWaterById(id);
  if (!location) notFound();

  const contaminants = location.utilities
    .flatMap((utility) =>
      utility.contaminants.map((item) => ({
        ...item,
        ingredient: getIngredient(item.ingredient_id.toString()),
        utilityName: utility.name,
      })),
    )
    .filter((item, index, list) => {
      const key = `${item.ingredient_id}:${item.utilityName}:${item.amount ?? 'null'}`;
      return list.findIndex((entry) => `${entry.ingredient_id}:${entry.utilityName}:${entry.amount ?? 'null'}` === key) === index;
    })
    .sort((a, b) => (b.ingredient?.severity_score ?? 0) - (a.ingredient?.severity_score ?? 0));

  const place = [location.name, location.state].filter(Boolean).join(', ');
  const zipLine = [location.zipCode && `ZIP ${location.zipCode}`, location.country].filter(Boolean).join(' · ');
  const exceeding = location.utilities.reduce(
    (sum, utility) => sum + utility.contaminantsExceedingGuidelines,
    0,
  );
  const contaminantCount = location.utilities.reduce((sum, utility) => sum + utility.totalContaminants, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: place,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.name ?? undefined,
      addressRegion: location.state ?? undefined,
      postalCode: location.zipCode ?? undefined,
      addressCountry: location.country ?? undefined,
    },
    url: absoluteUrl(`/tap-water/${id}`),
    description: `Municipal tap water quality data for ${place}.`,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Link href="/tap-water" className={`mb-10 inline-flex text-sm text-gray-500 transition hover:text-gray-700 link-back dark:text-gray-400 dark:hover:text-gray-200 ${motionPress}`}>
          Back to tap water search
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              Tap water {location.zipCode ? `· ZIP ${location.zipCode}` : ''}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Tap Water in {place}
            </h1>
            {zipLine && <p className="mt-4 text-base text-gray-600 dark:text-gray-400">{zipLine}</p>}
          </div>

          <div className={`overflow-hidden ${panelClass} p-0`}>
            <div className="h-64 bg-gray-100 dark:bg-[var(--surface-muted)]">
              {location.image ? (
                <img src={location.image} alt={location.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_32%_20%,rgba(125,211,252,0.5),transparent_35%),linear-gradient(135deg,#355070,#16213e_55%,#0f172a)]" />
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <TapWaterScorePanel score={location.score} label={scoreCopy(location.score)} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className={panelClass}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilities</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{location.utilities.length}</p>
            </div>
            <div className={panelClass}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Detected contaminants</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{contaminantCount}</p>
            </div>
            <div className={panelClass}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Over health guideline</p>
              <p className={`mt-3 text-3xl font-semibold ${scoreTone(location.score)}`}>{exceeding}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className={panelClass}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Water systems</h2>
            <ul className="mt-5 space-y-4">
              {location.utilities.map((utility, index) => (
                <li key={`${utility.name}-${index}`} className="rounded-lg bg-gray-50 p-4 dark:bg-[var(--surface-muted)]">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{utility.name || 'Water system'}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Score {utility.score ?? 'N/A'} · {utility.totalContaminants} contaminants ·{' '}
                    {utility.contaminantsExceedingGuidelines} over guideline
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className={panelClass}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detected contaminants</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sorted by Oasis ingredient severity when available.</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{contaminants.length.toLocaleString()} readings</span>
            </div>

            <ul className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
              {contaminants.slice(0, 32).map((item, index) => (
                <li key={`${item.ingredient_id}-${index}`} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    {item.ingredient ? (
                      <Link
                        href={`/ingredient/${item.ingredient_id}`}
                        className="block truncate text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
                      >
                        {item.ingredient.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        Ingredient #{item.ingredient_id}
                      </span>
                    )}
                    <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{item.utilityName}</span>
                  </span>
                  <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                    {amountLabel(item.amount, item.ingredient?.measure)}
                  </span>
                </li>
              ))}
              {contaminants.length === 0 && (
                <li className="py-8 text-sm text-gray-500 dark:text-gray-400">No contaminant details available.</li>
              )}
            </ul>
          </div>
        </section>

        {location.sources.length > 0 && (
          <section className={`mt-8 ${panelClass}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sources</h2>
            <ul className="mt-4 space-y-2">
              {location.sources.map((source, index) => (
                <li key={`${source.url}-${index}`}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-sky-600 hover:underline dark:text-sky-400"
                  >
                    {source.label || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
