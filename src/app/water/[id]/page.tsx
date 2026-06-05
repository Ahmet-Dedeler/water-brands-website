import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Water, IngredientsMap, ScoreBreakdownItem } from '@/types';
import { getWater, ingredients, siteUrl, waterCards, waterFilterCards } from '@/lib/data';
import Header from '@/components/Header';
import ScoreCircle from '@/components/ScoreCircle';
import { Metadata } from 'next';
import { waterTypeLabel, titleize, microplasticsRisk } from '@/lib/format';

const ingredientDetails = ingredients as IngredientsMap;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const water = getWater(id);
  if (!water) return { title: 'Water Not Found' };

  const title = `${water.name} — Score ${water.score}/100`;
  const description =
    water.description ||
    `${water.name}${water.brandName ? ` by ${water.brandName}` : ''} scores ${water.score}/100 for purity, source and packaging.`;

  return {
    title,
    description,
    alternates: { canonical: `/water/${id}` },
    openGraph: {
      title,
      description,
      url: `/water/${id}`,
      images: water.image ? [{ url: water.image, width: 800, height: 600, alt: water.name }] : [],
    },
  };
}

function resolveIngredients(water: Water) {
  return water.ingredients
    .map((ref) => {
      const detail = ingredientDetails[ref.ingredient_id];
      if (!detail || !detail.name) return null;
      const isContaminant = detail.is_contaminant || ref.is_contaminant === true;
      return { ...ref, ...detail, is_contaminant: isContaminant };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
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
  const isPenalty = item.id.endsWith('_penalty') || item.score < 0;
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

export default async function WaterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const water = getWater(id);
  if (!water) notFound();

  const resolved = resolveIngredients(water);
  const contaminants = resolved.filter((i) => i.is_contaminant);
  const nutrients = resolved.filter((i) => !i.is_contaminant);

  const labTested = water.scoreBreakdown.some((b) => b.id === 'lab_report' && b.score > 0);
  const mpRisk = microplasticsRisk(water.packaging);

  const chips = [
    water.packaging && titleize(water.packaging),
    water.waterSource && water.waterSource !== 'unknown' && titleize(water.waterSource),
    water.capMaterial && `${titleize(water.capMaterial)} cap`,
    water.isDistilled && 'Distilled',
  ].filter(Boolean) as string[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: water.name,
    description: water.description ?? `${water.name} bottled water purity score ${water.score}/100`,
    image: water.image ?? undefined,
    brand: water.brandName ? { '@type': 'Brand', name: water.brandName } : undefined,
    url: `${siteUrl}/water/${water.id}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: water.score,
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
      <Header waters={waterCards} filters={waterFilterCards} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href="/" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 inline-block">
          &larr; Back to all waters
        </Link>

        <div className="bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative flex items-center justify-center bg-gray-50 dark:bg-[var(--surface-muted)]/50 rounded-xl p-4 h-56">
              {water.image ? (
                <Image
                  src={water.image}
                  alt={water.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  className="object-contain p-3"
                  priority
                />
              ) : (
                <span className="text-5xl text-gray-200 dark:text-gray-700" aria-hidden="true">💧</span>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                {waterTypeLabel(water.type)}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{water.name}</h1>
              {water.brandName && <p className="text-gray-500 dark:text-gray-400 mt-1">by {water.brandName}</p>}

              <div className="flex items-center gap-4 mt-4">
                <ScoreCircle score={water.score} size={80} />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Purity score
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
            </div>
          </div>

          <dl className="border-t border-gray-100 dark:border-[var(--border-soft)] grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-gray-100 dark:divide-gray-800">
            <Stat label="Lab Tested" value={labTested ? 'Yes' : 'No'} tone={labTested ? 'good' : 'bad'} />
            <Stat label="Contaminants" value={contaminants.length} tone={contaminants.length ? 'bad' : 'good'} />
            <Stat label="Minerals" value={nutrients.length} />
            <Stat label="Microplastics" value={mpRisk} tone={mpRisk === 'Low' ? 'good' : mpRisk === 'High' ? 'bad' : 'default'} />
            {water.ph != null && <Stat label="pH" value={water.ph} />}
            {water.tds != null && <Stat label="TDS" value={`${water.tds} ppm`} />}
            {water.fluoride != null && <Stat label="Fluoride" value={`${water.fluoride} mg/L`} tone={water.fluoride > 0 ? 'bad' : 'good'} />}
            <Stat label="PFAS Tested" value={water.isPfasTested ? 'Yes' : 'No'} tone={water.isPfasTested ? 'good' : 'default'} />
          </dl>

          <div className="p-6 md:p-8 space-y-8">
            {water.description && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">About</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{water.description}</p>
              </section>
            )}

            {water.scoreBreakdown.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Score breakdown</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">How this water earned its {water.score}/100.</p>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {water.scoreBreakdown.map((item) => (
                    <ScoreBar key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            )}

            {water.filtrationMethods.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Filtration & treatment</h2>
                <div className="flex flex-wrap gap-2">
                  {water.filtrationMethods.map((m) => (
                    <span key={m} className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-sm">{m}</span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Contaminants</h2>
              <ul className="space-y-3">
                {contaminants.map((item, index) => (
                  <li key={index} className="p-4 bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 rounded-r-lg">
                    <div className="flex justify-between items-baseline gap-3">
                      <h3 className="font-semibold text-rose-900 dark:text-rose-200">
                        <Link href={`/ingredient/${item.ingredient_id}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </h3>
                      {item.amount != null && (
                        <span className="text-sm font-medium text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {item.amount} {item.measure}
                        </span>
                      )}
                    </div>
                    {item.risks && <p className="text-sm text-rose-800/90 dark:text-rose-300/90 mt-1">{item.risks}</p>}
                    {(item.legal_limit != null || item.health_guideline != null) && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                        {item.legal_limit != null && <>Legal limit: {item.legal_limit} </>}
                        {item.health_guideline != null && <>· Health guideline: {item.health_guideline}</>}
                      </p>
                    )}
                  </li>
                ))}
                {contaminants.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No contaminants flagged in the available data.</p>
                )}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Minerals & nutrients</h2>
              <ul className="space-y-3">
                {nutrients.map((item, index) => (
                  <li key={index} className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500 rounded-r-lg">
                    <div className="flex justify-between items-baseline gap-3">
                      <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">
                        <Link href={`/ingredient/${item.ingredient_id}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </h3>
                      {item.amount != null && (
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {item.amount} {item.measure}
                        </span>
                      )}
                    </div>
                    {item.benefits && item.benefits !== 'None' && (
                      <p className="text-sm text-emerald-800/90 dark:text-emerald-300/90 mt-1">{item.benefits}</p>
                    )}
                  </li>
                ))}
                {nutrients.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No minerals listed.</p>}
              </ul>
            </section>

            {water.sources.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Sources</h2>
                <ul className="space-y-2">
                  {water.sources.map((source, index) => (
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
