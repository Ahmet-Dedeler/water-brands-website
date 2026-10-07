import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { pageMetadata } from '@/lib/metadata';
import { getGuide, GUIDES } from '@/lib/guides';
import { articleLd, Breadcrumbs, breadcrumbLd, FaqSection, faqLd, JsonLd, prose, UpdatedLine } from '@/components/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  const base = pageMetadata({ title: g.title, description: g.description, path: `/guides/${slug}` });
  return {
    ...base,
    title: { absolute: g.title },
    openGraph: { ...base.openGraph, type: 'article', publishedTime: g.published, modifiedTime: g.updated },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const path = `/guides/${slug}`;
  const crumbs = [
    { name: 'Guides', path: '/guides' },
    { name: g.h1, path },
  ];
  const faqs = g.faqs();
  const others = GUIDES.filter((x) => x.slug !== slug);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd
        data={[
          articleLd({ headline: g.h1, description: g.description, path, datePublished: g.published, dateModified: g.updated }),
          breadcrumbLd(crumbs),
          faqLd(faqs),
        ]}
      />
      <Header />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          <span aria-hidden="true">{g.emoji} </span>
          {g.h1}
        </h1>
        <div className="mt-3">
          <UpdatedLine date={g.updated} />
        </div>
        <div className={`mt-6 ${prose}`}>{g.body()}</div>

        <FaqSection faqs={faqs} />

        <section className="mt-12">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">More guides</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {others.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/guides/${x.slug}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-900 hover:shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-100"
                >
                  <span aria-hidden="true">{x.emoji} </span>
                  {x.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
