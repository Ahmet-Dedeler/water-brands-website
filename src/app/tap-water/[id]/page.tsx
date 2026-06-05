import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getIngredient } from '@/lib/data';
import { absoluteUrl, pageMetadata } from '@/lib/metadata';
import { getTapWaterById } from '@/lib/tap-water';
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

const scoreTone = (score: number | null) => {
  if (score == null) return 'text-stone-400';
  if (score >= 70) return 'text-emerald-300';
  if (score >= 50) return 'text-amber-300';
  return 'text-red-300';
};

const amountLabel = (amount: number | null, measure: string | null | undefined) => {
  if (amount == null) return 'Detected';
  const formatted =
    Math.abs(amount) < 0.001 && amount !== 0
      ? amount.toExponential(2)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(amount);
  return [formatted, measure].filter(Boolean).join(' ');
};

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
    <main className="min-h-screen bg-[#151413] text-stone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
          <span className="text-lg" aria-hidden="true">🚰</span>
          <span>Water Leaderboard</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-stone-400" aria-label="Primary">
          <Link href="/" className="transition hover:text-stone-100">Rankings</Link>
          <Link href="/tap-water" className="transition hover:text-stone-100">Tap water</Link>
          <Link href="/filter" className="hidden transition hover:text-stone-100 sm:inline">Filters</Link>
          <Link href="/ingredients" className="hidden transition hover:text-stone-100 sm:inline">Ingredients</Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Link href="/tap-water" className={`mb-10 inline-flex text-sm text-stone-500 transition hover:text-stone-200 link-back ${motionPress}`}>
          Back to tap water search
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Tap water {location.zipCode ? `· ZIP ${location.zipCode}` : ''}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-stone-100 sm:text-5xl">
              Tap Water in {place}
            </h1>
            {zipLine && <p className="mt-4 text-base text-stone-400">{zipLine}</p>}
          </div>

          <div className="overflow-hidden rounded-lg border border-stone-800 bg-[#1f1b18]">
            <div className="h-56 bg-stone-900">
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
            <div className="rounded-lg border border-stone-800 bg-[#1f1b18] p-6">
              <p className="text-sm text-stone-500">Utilities</p>
              <p className="mt-3 text-3xl font-semibold text-stone-50">{location.utilities.length}</p>
            </div>
            <div className="rounded-lg border border-stone-800 bg-[#1f1b18] p-6">
              <p className="text-sm text-stone-500">Detected contaminants</p>
              <p className="mt-3 text-3xl font-semibold text-stone-50">{contaminantCount}</p>
            </div>
            <div className="rounded-lg border border-stone-800 bg-[#1f1b18] p-6">
              <p className="text-sm text-stone-500">Over health guideline</p>
              <p className={`mt-3 text-3xl font-semibold ${scoreTone(location.score)}`}>{exceeding}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-stone-800 bg-[#1f1b18] p-6">
            <h2 className="text-lg font-semibold text-stone-50">Water systems</h2>
            <ul className="mt-5 space-y-4">
              {location.utilities.map((utility, index) => (
                <li key={`${utility.name}-${index}`} className="rounded-md bg-[#181513] p-4">
                  <p className="font-medium text-stone-100">{utility.name || 'Water system'}</p>
                  <p className="mt-2 text-sm text-stone-500">
                    Score {utility.score ?? 'N/A'} · {utility.totalContaminants} contaminants ·{' '}
                    {utility.contaminantsExceedingGuidelines} over guideline
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-stone-800 bg-[#1f1b18] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-50">Detected contaminants</h2>
                <p className="mt-1 text-sm text-stone-500">Sorted by Oasis ingredient severity when available.</p>
              </div>
              <span className="text-sm text-stone-500">{contaminants.length.toLocaleString()} readings</span>
            </div>

            <ul className="mt-5 divide-y divide-stone-800">
              {contaminants.slice(0, 32).map((item, index) => (
                <li key={`${item.ingredient_id}-${index}`} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    {item.ingredient ? (
                      <Link
                        href={`/ingredient/${item.ingredient_id}`}
                        className="block truncate text-sm font-medium text-stone-100 hover:underline"
                      >
                        {item.ingredient.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium text-stone-100">
                        Ingredient #{item.ingredient_id}
                      </span>
                    )}
                    <span className="mt-0.5 block truncate text-xs text-stone-500">{item.utilityName}</span>
                  </span>
                  <span className="shrink-0 text-sm text-stone-400">
                    {amountLabel(item.amount, item.ingredient?.measure)}
                  </span>
                </li>
              ))}
              {contaminants.length === 0 && (
                <li className="py-8 text-sm text-stone-500">No contaminant details available.</li>
              )}
            </ul>
          </div>
        </section>

        {location.sources.length > 0 && (
          <section className="mt-8 rounded-lg border border-stone-800 bg-[#1f1b18] p-6">
            <h2 className="text-lg font-semibold text-stone-50">Sources</h2>
            <ul className="mt-4 space-y-2">
              {location.sources.map((source, index) => (
                <li key={`${source.url}-${index}`}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-indigo-300 hover:underline"
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
