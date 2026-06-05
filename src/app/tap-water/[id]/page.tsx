import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { getIngredient } from '@/lib/data';
import { absoluteUrl, pageMetadata } from '@/lib/metadata';
import { getTapWaterById } from '@/lib/tap-water';

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

export default async function TapWaterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const location = await getTapWaterById(id);
  if (!location) notFound();

  const contaminants = location.utilities.flatMap((utility) =>
    utility.contaminants.map((item) => ({
      ...item,
      ingredient: getIngredient(item.ingredient_id.toString()),
    })),
  );

  const place = [location.name, location.state, location.zipCode].filter(Boolean).join(', ');
  const exceeding = location.utilities.reduce(
    (sum, utility) => sum + utility.contaminantsExceedingGuidelines,
    0,
  );

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href="/tap-water" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 inline-block">
          &larr; Back to tap water rankings
        </Link>

        <div className="bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{location.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {[location.state, location.country, location.zipCode].filter(Boolean).join(', ')}
            </p>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Score: <span className="font-semibold text-gray-900 dark:text-gray-100">{location.score ?? 'N/A'}</span>
              {exceeding > 0 && (
                <span className="ml-3 text-amber-700 dark:text-amber-400">
                  {exceeding} contaminant{exceeding === 1 ? '' : 's'} over health guideline
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-[var(--border-soft)] p-6 md:p-8 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Utilities</h2>
              <ul className="space-y-3">
                {location.utilities.map((utility, idx) => (
                  <li key={`${utility.name}-${idx}`} className="p-4 rounded-xl border border-gray-200 dark:border-[var(--border-soft)]">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{utility.name || 'Utility'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Score {utility.score ?? 'N/A'} • {utility.totalContaminants} contaminants • {utility.contaminantsExceedingGuidelines} over guideline
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Detected contaminants</h2>
              <ul className="space-y-2">
                {contaminants.map((item, idx) => (
                  <li key={`${item.ingredient_id}-${idx}`} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.ingredient ? (
                        <Link href={`/ingredient/${item.ingredient_id}`} className="hover:underline">
                          {item.ingredient.name}
                        </Link>
                      ) : (
                        `Ingredient #${item.ingredient_id}`
                      )}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.amount ?? '—'} {item.ingredient?.measure ?? ''}
                    </span>
                  </li>
                ))}
                {contaminants.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No contaminant details available.</p>
                )}
              </ul>
            </section>

            {location.sources.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Sources</h2>
                <ul className="space-y-2">
                  {location.sources.map((source, index) => (
                    <li key={`${source.url}-${index}`}>
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
