// Server components shared by the SEO landing pages: structured data, breadcrumbs,
// FAQ blocks and the ranked product list. Kept server-only so the HTML that
// crawlers and AI answer engines read is complete without running JS.

import Image from 'next/image';
import Link from 'next/link';
import type { Water, WaterFilter } from '@/types';
import type { FAQ } from '@/lib/rankings';
import { absoluteUrl } from '@/lib/metadata';
import { SITE_NAME, siteUrl } from '@/lib/site';
import { lowerLabel, filterTypeLabel, microplasticsRisk, scoreTier, SCORE_COLORS, titleize, waterTypeLabel } from '@/lib/format';

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output can't break out of the script tag once "<" is escaped.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqLd(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function itemListLd(name: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export const publisherLd = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: siteUrl,
  logo: absoluteUrl('/logo-512.png'),
};

export function articleLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    mainEntityOfPage: absoluteUrl(path),
    datePublished,
    dateModified,
    author: publisherLd,
    publisher: publisherLd,
    image: absoluteUrl('/opengraph-image'),
  };
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-gray-800 dark:hover:text-gray-200">Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {i === crumbs.length - 1 ? (
              <span className="text-gray-700 dark:text-gray-300" aria-current="page">{c.name}</span>
            ) : (
              <Link href={c.path} className="hover:text-gray-800 dark:hover:text-gray-200">{c.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FaqSection({ faqs, title = 'Frequently asked questions' }: { faqs: FAQ[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            open
            className="group rounded-xl border border-gray-200 bg-white p-5 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]"
          >
            <summary className="cursor-pointer list-none font-semibold text-gray-900 dark:text-gray-100">
              <h3 className="inline">{f.q}</h3>
            </summary>
            <p className="mt-2 leading-7 text-gray-600 dark:text-gray-400">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ScorePill({ score }: { score: number }) {
  const colors = SCORE_COLORS[scoreTier(score)];
  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-full ${colors.bg} ${colors.text} font-bold ring-1 ${colors.ring}`}>
      {score}
    </span>
  );
}

const isWater = (item: Water | WaterFilter): item is Water => 'packaging' in item;

/** Facts shown under each ranked item — plain text so they are quotable. */
function itemFacts(item: Water | WaterFilter): string[] {
  if (isWater(item)) {
    return [
      waterTypeLabel(item.type),
      item.packaging ? titleize(item.packaging) : null,
      item.waterSource && item.waterSource !== 'unknown' ? titleize(item.waterSource) : null,
      item.hasLabTest ? 'Lab tested' : 'No lab report',
      `Microplastics risk: ${microplasticsRisk(item.packaging)}`,
      item.ph != null && item.ph > 0 ? `pH ${item.ph}` : null,
      item.tds != null && item.tds > 0 ? `TDS ${item.tds} ppm` : null,
      item.isPfasTested ? 'PFAS tested' : null,
    ].filter(Boolean) as string[];
  }
  return [
    filterTypeLabel(item.type),
    item.technologies.slice(0, 3).join(', ') || null,
    item.certifications.length ? `Certified: ${item.certifications.slice(0, 3).join(', ')}` : null,
    item.hasLabTest ? 'Lab tested' : null,
    item.price ? `$${item.price}` : null,
  ].filter(Boolean) as string[];
}

export const itemPath = (item: Water | WaterFilter) => (isWater(item) ? `/water/${item.id}` : `/filter/${item.id}`);

export function RankedList({ items }: { items: (Water | WaterFilter)[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => {
        const strengths = item.scoreBreakdown
          .filter((b) => b.max && b.score >= b.max * 0.9)
          .map((b) => lowerLabel(b.label))
          .slice(0, 3);
        const weaknesses = item.scoreBreakdown
          .filter((b) => b.max && b.score <= b.max * 0.5)
          .map((b) => lowerLabel(b.label))
          .slice(0, 3);
        return (
          <li key={item.id}>
            <Link
              href={itemPath(item)}
              className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]"
            >
              <span className="w-8 shrink-0 pt-3 text-right text-sm font-bold tabular-nums text-gray-400 dark:text-gray-500">#{i + 1}</span>
              <div className="relative h-20 w-20 shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain" loading="lazy" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl" aria-hidden="true">💧</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-snug text-gray-900 dark:text-gray-100">{item.name}</h3>
                {item.brandName && <p className="text-sm text-gray-500 dark:text-gray-400">{item.brandName}</p>}
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{itemFacts(item).join(' · ')}</p>
                {(strengths.length > 0 || weaknesses.length > 0) && (
                  <p className="mt-1 text-xs">
                    {strengths.length > 0 && <span className="text-emerald-700 dark:text-emerald-400">Strong: {strengths.join(', ')}. </span>}
                    {weaknesses.length > 0 && <span className="text-rose-700 dark:text-rose-400">Weak: {weaknesses.join(', ')}.</span>}
                  </p>
                )}
              </div>
              <ScorePill score={item.score} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function UpdatedLine({ date }: { date: string }) {
  const pretty = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Updated <time dateTime={date}>{pretty}</time> · Scores from third-party lab reports ·{' '}
      <Link href="/scoring" className="underline hover:text-gray-800 dark:hover:text-gray-200">How we score</Link>
    </p>
  );
}

export const prose = 'space-y-4 text-[1.05rem] leading-8 text-gray-700 dark:text-gray-300';
