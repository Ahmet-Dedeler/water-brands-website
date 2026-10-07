import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { pageMetadata } from '@/lib/metadata';
import { getRanking, RANKINGS, rankingItems, type FAQ, type Ranking } from '@/lib/rankings';
import { CONTENT_UPDATED } from '@/lib/site';
import {
  Breadcrumbs,
  breadcrumbLd,
  FaqSection,
  faqLd,
  itemListLd,
  itemPath,
  JsonLd,
  prose,
  RankedList,
  UpdatedLine,
} from '@/components/seo';
import type { Water, WaterFilter } from '@/types';

export const dynamicParams = false;

export function generateStaticParams() {
  return RANKINGS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRanking(slug);
  if (!r) return {};
  return {
    ...pageMetadata({ title: r.title, description: r.description, path: `/best/${slug}` }),
    title: { absolute: r.title },
  };
}

// Narrowing helper: TypeScript can't correlate the union members through one call.
function resolve(r: Ranking): { items: (Water | WaterFilter)[]; total: number; intro: string[]; faqs: FAQ[] } {
  if (r.kind === 'water') {
    const { items, total } = rankingItems(r);
    return { items, total, intro: items.length ? r.intro(items, total) : [], faqs: items.length ? r.faqs(items, total) : [] };
  }
  const { items, total } = rankingItems(r);
  return { items, total, intro: items.length ? r.intro(items, total) : [], faqs: items.length ? r.faqs(items, total) : [] };
}

export default async function BestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRanking(slug);
  if (!r) notFound();

  const { items, total, intro, faqs } = resolve(r);
  const path = `/best/${slug}`;
  const crumbs = [
    { name: 'Best of', path: '/best' },
    { name: r.label, path },
  ];
  const related = r.related.map(getRanking).filter((x): x is Ranking => Boolean(x));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          itemListLd(r.h1, items.map((i) => ({ name: i.name, path: itemPath(i) }))),
          faqLd(faqs),
        ]}
      />
      <Header />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          <span aria-hidden="true">{r.emoji} </span>
          {r.h1}
        </h1>
        <div className="mt-3">
          <UpdatedLine date={CONTENT_UPDATED} />
        </div>

        <div className={`mt-6 ${prose}`}>
          {intro.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Top {items.length} ranked
        </h2>
        <RankedList items={items} />

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Showing the top {items.length} of {total}.{' '}
          <Link href={r.kind === 'water' ? '/' : '/filter'} className="underline">
            See the full {r.kind === 'water' ? 'water' : 'filter'} leaderboard
          </Link>{' '}
          with filters for packaging, source and lab testing.
        </p>

        <FaqSection faqs={faqs} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Related rankings</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((x) => (
                <li key={x.slug}>
                  <Link
                    href={`/best/${x.slug}`}
                    className="block rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 hover:shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-100"
                  >
                    <span aria-hidden="true">{x.emoji} </span>
                    {x.h1}
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
