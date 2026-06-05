import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { getIngredient, ingredientList, siteUrl, waterCards, waters } from '@/lib/data';
import { waterTypeLabel } from '@/lib/format';

export function generateStaticParams() {
  return ingredientList.map((ingredient) => ({ id: ingredient.id.toString() }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ingredient = getIngredient(id);
  if (!ingredient) return { title: 'Ingredient Not Found' };

  const title = `${ingredient.name} in Water`;
  const description =
    ingredient.description ||
    `${ingredient.name} health profile, water guidelines, risks, benefits and references.`;

  return {
    title,
    description,
    alternates: { canonical: `/ingredient/${id}` },
    openGraph: {
      title,
      description,
      url: `/ingredient/${id}`,
      images: ingredient.image ? [{ url: ingredient.image, width: 800, height: 600, alt: ingredient.name }] : [],
    },
  };
}

function impactScore(severity: number, bonus: number) {
  return bonus - severity;
}

function scoreLabel(score: number) {
  if (score <= -4) return 'Very bad';
  if (score < 0) return 'Poor';
  if (score === 0) return 'Okay';
  if (score < 4) return 'Good';
  return 'Very good';
}

function scoreTone(score: number) {
  if (score < 0) return 'text-rose-600 dark:text-rose-400';
  if (score > 0) return 'text-emerald-600 dark:text-emerald-400';
  return 'text-gray-700 dark:text-gray-300';
}

function formatLimit(value: number | null, measure: string | null) {
  if (value == null) return 'Not specified';
  return `${value} ${measure || ''}`.trim();
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h2>
      <div className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>
    </section>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const clamped = Math.max(-5, Math.min(5, score));
  const pct = ((clamped + 5) / 10) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Health score</span>
        <span className={`text-3xl font-bold tabular-nums ${scoreTone(score)}`}>
          {score > 0 ? '+' : ''}
          {score.toFixed(1)}
        </span>
      </div>
      <div className="relative mt-4 h-3 rounded-full bg-gradient-to-r from-rose-500 via-gray-200 to-emerald-500 dark:via-gray-700">
        <span
          className="absolute top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-gray-950 dark:bg-white shadow"
          style={{ left: `calc(${pct}% - 3px)` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>-5</span>
        <span>{scoreLabel(score)}</span>
        <span>5</span>
      </div>
    </div>
  );
}

export default async function IngredientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ingredient = getIngredient(id);
  if (!ingredient) notFound();

  const score = impactScore(ingredient.severity_score, ingredient.bonus_score);
  const updated = formatDate(ingredient.updated_at);
  const relatedWaters = waters
    .filter((water) => water.ingredients.some((item) => item.ingredient_id === ingredient.id))
    .sort((a, b) => b.score - a.score || b.views - a.views)
    .slice(0, 12);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: ingredient.name,
    description: ingredient.description ?? undefined,
    image: ingredient.image ?? undefined,
    url: `${siteUrl}/ingredient/${ingredient.id}`,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header waters={waterCards} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href="/" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 inline-block">
          &larr; Back to all waters
        </Link>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 p-6 md:p-8">
            <div className="relative flex h-60 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
              {ingredient.image ? (
                <Image
                  src={ingredient.image}
                  alt={ingredient.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 260px"
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <span className="text-5xl text-gray-200 dark:text-gray-700" aria-hidden="true">
                  H2O
                </span>
              )}
            </div>

            <div className="min-w-0">
              {ingredient.category && (
                <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                  {ingredient.category}
                </p>
              )}
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {ingredient.name}
              </h1>
              {ingredient.description && (
                <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  {ingredient.description}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  ingredient.is_contaminant
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}>
                  {ingredient.is_contaminant ? 'Tracked contaminant' : 'Mineral or nutrient'}
                </span>
                {updated && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    Updated {updated}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <ScoreMeter score={score} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoBlock title="Water guidelines">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Legal limit</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {formatLimit(ingredient.legal_limit, ingredient.measure)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Health guideline</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {formatLimit(ingredient.health_guideline, ingredient.measure)}
                </dd>
              </div>
            </dl>
          </InfoBlock>

          <InfoBlock title="Food and supplement guidelines">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Legal limit</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {formatLimit(ingredient.legal_limit_food, ingredient.measure_food)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Health guideline</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {formatLimit(ingredient.health_guideline_food, ingredient.measure_food)}
                </dd>
              </div>
            </dl>
          </InfoBlock>

          <InfoBlock title="Risks">
            <p>{ingredient.risks || 'None listed.'}</p>
          </InfoBlock>

          <InfoBlock title="Benefits">
            <p>{ingredient.benefits || 'None listed.'}</p>
          </InfoBlock>
        </div>

        {ingredient.sources.length > 0 && (
          <section className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">References</h2>
            <ul className="mt-3 space-y-2">
              {ingredient.sources.map((source, index) => (
                <li key={`${source.url}-${index}`}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 dark:text-sky-400 hover:underline break-words"
                  >
                    {source.label || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedWaters.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Waters containing {ingredient.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {relatedWaters.length === 12 ? 'Top matches by score' : `${relatedWaters.length} matches`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedWaters.map((water) => (
                <Link
                  key={water.id}
                  href={`/water/${water.id}`}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 shrink-0">
                      {water.image ? (
                        <Image src={water.image} alt="" fill sizes="56px" className="object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-700">
                          H2O
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{water.name}</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{waterTypeLabel(water.type)}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-sm font-bold tabular-nums text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                      {water.score}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
