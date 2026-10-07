import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { pageMetadata } from '@/lib/metadata';
import { COMPARISONS, comparisonsFor, contaminantCount, getComparison, reversedComparison } from '@/lib/compare';
import { CONTENT_UPDATED, CONTENT_YEAR } from '@/lib/site';
import { lowerLabel, microplasticsRisk, scoreTier, SCORE_COLORS, titleize, waterTypeLabel } from '@/lib/format';
import { Breadcrumbs, breadcrumbLd, FaqSection, faqLd, JsonLd, prose, UpdatedLine } from '@/components/seo';
import type { FAQ } from '@/lib/rankings';
import type { Water } from '@/types';

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return {};
  const title = `${c.aBrand} vs ${c.bBrand}: Which Water Is Healthier? (${CONTENT_YEAR})`;
  const description = `${c.aBrand} scores ${c.a.score}/100 and ${c.bBrand} scores ${c.b.score}/100. Compare lab-tested contaminants, pH, minerals, source, packaging and microplastics risk side by side.`;
  return { ...pageMetadata({ title, description, path: `/compare/${slug}` }), title: { absolute: title } };
}

const yesNo = (v: boolean) => (v ? 'Yes' : 'No');
const num = (v: number | null, unit = '') => (v != null && v > 0 ? `${v}${unit}` : '—');

function rows(w: Water): [string, string][] {
  return [
    ['Purity score', `${w.score}/100`],
    ['Product compared', w.name],
    ['Type', waterTypeLabel(w.type)],
    ['Water source', w.waterSource && w.waterSource !== 'unknown' ? titleize(w.waterSource) : 'Not disclosed'],
    ['Packaging', w.packaging ? titleize(w.packaging) : '—'],
    ['Microplastics risk', microplasticsRisk(w.packaging)],
    ['Lab tested', yesNo(w.hasLabTest)],
    ['PFAS tested', yesNo(w.isPfasTested)],
    ['Contaminants flagged', String(contaminantCount(w))],
    ['pH', num(w.ph)],
    ['TDS (minerals)', num(w.tds, ' ppm')],
    ['Fluoride', w.fluoride != null ? `${w.fluoride} mg/L` : '—'],
  ];
}

function verdict(a: Water, b: Water, aName: string, bName: string) {
  if (a.score === b.score) {
    return `${aName} and ${bName} tie at ${a.score}/100. The difference comes down to packaging and source: compare the rows below to pick the one that fits what you care about.`;
  }
  const [win, lose, winName, loseName] = a.score > b.score ? [a, b, aName, bName] : [b, a, bName, aName];
  const gaps = win.scoreBreakdown
    .map((item) => {
      const other = lose.scoreBreakdown.find((x) => x.id === item.id);
      return { label: lowerLabel(item.label), diff: item.score - (other?.score ?? 0) };
    })
    .filter((g) => g.diff > 0)
    .sort((x, y) => y.diff - x.diff)
    .slice(0, 2)
    .map((g) => g.label);
  return `${winName} is the healthier choice, scoring ${win.score}/100 versus ${lose.score}/100 for ${loseName}.${
    gaps.length ? ` The biggest differences are ${gaps.join(' and ')}.` : ''
  }`;
}

function ScoreBig({ w, name }: { w: Water; name: string }) {
  const colors = SCORE_COLORS[scoreTier(w.score)];
  return (
    <Link href={`/water/${w.id}`} className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 text-center hover:shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
      <div className="relative h-32 w-32">
        {w.image ? <Image src={w.image} alt={w.name} fill sizes="128px" className="object-contain" priority /> : <span className="text-5xl" aria-hidden="true">💧</span>}
      </div>
      <p className="mt-3 font-semibold text-gray-900 dark:text-gray-100">{name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{w.name}</p>
      <span className={`mt-3 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ring-1 ${colors.bg} ${colors.text} ${colors.ring}`}>
        {w.score}
      </span>
    </Link>
  );
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) {
    const rev = reversedComparison(slug);
    if (rev) permanentRedirect(`/compare/${rev.slug}`);
    notFound();
  }

  const { a, b, aBrand, bBrand } = c;
  const path = `/compare/${slug}`;
  const crumbs = [
    { name: 'Best of', path: '/best' },
    { name: `${aBrand} vs ${bBrand}`, path },
  ];
  const aRows = rows(a);
  const bRows = rows(b);
  const summary = verdict(a, b, aBrand, bBrand);

  const faqs: FAQ[] = [
    { q: `Which is better, ${aBrand} or ${bBrand}?`, a: summary },
    {
      q: `Is ${aBrand} or ${bBrand} better for avoiding microplastics?`,
      a: `${aBrand} (${a.packaging ?? 'unknown packaging'}) has a ${microplasticsRisk(a.packaging).toLowerCase()} microplastics risk and ${bBrand} (${b.packaging ?? 'unknown packaging'}) has a ${microplasticsRisk(b.packaging).toLowerCase()} risk, based on packaging material.`,
    },
    {
      q: `Which has more minerals, ${aBrand} or ${bBrand}?`,
      a:
        a.tds && b.tds
          ? `${a.tds > b.tds ? aBrand : bBrand} has more dissolved minerals (${Math.max(a.tds, b.tds)} ppm TDS vs ${Math.min(a.tds, b.tds)} ppm).`
          : 'Total dissolved solids (TDS) is not reported for both products, so check each product page for its mineral list.',
    },
  ];

  const more = [...comparisonsFor(a.brandSlug!), ...comparisonsFor(b.brandSlug!)]
    .filter((x) => x.slug !== slug)
    .filter((x, i, arr) => arr.findIndex((y) => y.slug === x.slug) === i)
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd data={[breadcrumbLd(crumbs), faqLd(faqs)]} />
      <Header />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {aBrand} vs {bBrand}: which water is healthier?
        </h1>
        <div className="mt-3">
          <UpdatedLine date={CONTENT_UPDATED} />
        </div>
        <div className={`mt-6 ${prose}`}>
          <p>{summary}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <ScoreBig w={a} name={aBrand} />
          <ScoreBig w={b} name={bBrand} />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Side-by-side comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left dark:border-[var(--border-soft)]">
                  <th className="p-3 font-medium text-gray-500 dark:text-gray-400" scope="col"></th>
                  <th className="p-3 font-semibold text-gray-900 dark:text-gray-100" scope="col">{aBrand}</th>
                  <th className="p-3 font-semibold text-gray-900 dark:text-gray-100" scope="col">{bBrand}</th>
                </tr>
              </thead>
              <tbody>
                {aRows.map(([label, value], i) => (
                  <tr key={label} className="border-b border-gray-100 last:border-0 dark:border-[var(--border-soft)]">
                    <th scope="row" className="p-3 text-left font-medium text-gray-500 dark:text-gray-400">{label}</th>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{value}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{bRows[i][1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Score breakdown</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left dark:border-[var(--border-soft)]">
                  <th className="p-3 font-medium text-gray-500 dark:text-gray-400" scope="col">Factor</th>
                  <th className="p-3 font-semibold text-gray-900 dark:text-gray-100" scope="col">{aBrand}</th>
                  <th className="p-3 font-semibold text-gray-900 dark:text-gray-100" scope="col">{bBrand}</th>
                </tr>
              </thead>
              <tbody>
                {a.scoreBreakdown.map((item) => {
                  const other = b.scoreBreakdown.find((x) => x.id === item.id);
                  return (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0 dark:border-[var(--border-soft)]">
                      <th scope="row" className="p-3 text-left font-medium text-gray-500 dark:text-gray-400">{item.label}</th>
                      <td className="p-3 tabular-nums text-gray-900 dark:text-gray-100">{item.score}{item.max ? `/${item.max}` : ''}</td>
                      <td className="p-3 tabular-nums text-gray-900 dark:text-gray-100">{other ? `${other.score}${other.max ? `/${other.max}` : ''}` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Each brand is represented by its most popular product. See all products from{' '}
            <Link className="underline" href={`/brand/${a.brandSlug}`}>{aBrand}</Link> and{' '}
            <Link className="underline" href={`/brand/${b.brandSlug}`}>{bBrand}</Link>.
          </p>
        </section>

        <FaqSection faqs={faqs} />

        {more.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">More comparisons</h2>
            <ul className="flex flex-wrap gap-2">
              {more.map((x) => (
                <li key={x.slug}>
                  <Link href={`/compare/${x.slug}`} className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-gray-300 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-200">
                    {x.aBrand} vs {x.bBrand}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
