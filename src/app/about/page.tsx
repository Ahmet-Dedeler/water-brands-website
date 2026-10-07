import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { pageMetadata } from '@/lib/metadata';
import { waters, waterFilters, tapWaterCards } from '@/lib/data';
import { DATA_SOURCE, SITE_NAME } from '@/lib/site';
import { Breadcrumbs, breadcrumbLd, JsonLd, prose } from '@/components/seo';

const title = `About ${SITE_NAME}: How We Rank Water`;
const description = `${SITE_NAME} is an independent ranking of bottled water, water filters and tap water built from third-party lab reports. No paid placements.`;

export const metadata: Metadata = {
  ...pageMetadata({ title, description, path: '/about' }),
  title: { absolute: title },
};

export default function About() {
  const labTested = waters.filter((w) => w.hasLabTest).length;
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd data={breadcrumbLd([{ name: 'About', path: '/about' }])} />
      <Header />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <Breadcrumbs crumbs={[{ name: 'About', path: '/about' }]} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">About {SITE_NAME}</h1>
        <div className={`mt-6 ${prose}`}>
          <p>
            {SITE_NAME} answers one question: <strong>which water is actually clean?</strong> We rank{' '}
            {waters.length.toLocaleString()} bottled waters, {waterFilters.length} water filters and{' '}
            {tapWaterCards.length.toLocaleString()} US tap water locations on a 0–100 purity score.
          </p>
          <h2 className="!mt-10 text-2xl font-bold text-gray-900 dark:text-gray-100">Where the data comes from</h2>
          <p>
            Product data, lab reports and contaminant measurements come from{' '}
            <a className="underline" href={DATA_SOURCE.url} target="_blank" rel="noopener noreferrer">{DATA_SOURCE.name}</a>, which
            collects third-party lab reports from brands and independent testing. {labTested} of the waters we rank have a lab
            report on file. Tap water data comes from utility testing reports. Contaminant limits come from the EPA and health
            guidelines from public health agencies.
          </p>
          <h2 className="!mt-10 text-2xl font-bold text-gray-900 dark:text-gray-100">How scores work</h2>
          <p>
            Waters are scored on seven factors: a lab report being on file, contaminants versus legal limits and health guidelines,
            water source, mineral preservation, packaging material, cap material and PFAS testing. Filters are scored on verified
            contaminant removal, certifications and lab evidence. The full breakdown is on{' '}
            <Link className="underline" href="/scoring">how water scores work</Link> and{' '}
            <Link className="underline" href="/scoring/water-filters">how filter scores work</Link>.
          </p>
          <h2 className="!mt-10 text-2xl font-bold text-gray-900 dark:text-gray-100">Independence</h2>
          <p>
            Brands cannot pay to change their score or their position. Rankings are generated from the data, so every list on the
            site updates when new lab reports arrive.
          </p>
          <h2 className="!mt-10 text-2xl font-bold text-gray-900 dark:text-gray-100">Not medical advice</h2>
          <p>
            Scores compare products against each other and against health guidelines. They are not a safety certification. If you
            have a medical condition, talk to your doctor about your water.
          </p>
        </div>
      </article>
    </main>
  );
}
