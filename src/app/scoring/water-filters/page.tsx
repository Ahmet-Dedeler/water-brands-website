import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { ingredientSearchCards, waterCards, waterFilterCards } from '@/lib/data';

export const metadata: Metadata = {
  title: 'How Water Filter Scores Work',
  description:
    'How Water Leaderboard explains water filter scores from verified contaminant removal, lab data, certifications and disclosed filter technology.',
  alternates: { canonical: '/scoring/water-filters' },
};

const filterRules = [
  {
    id: 'verified_removal',
    label: 'Verified contaminant removal',
    max: 70,
    share: '70%',
    description:
      'Weighted measured removal across contaminant categories. Filters need published measurements to earn points here.',
    inputs: ['Filtered contaminant categories', 'Removal percentages'],
  },
  {
    id: 'lab_indexed',
    label: 'Lab data indexed',
    max: 15,
    share: '15%',
    description:
      'Credit for a full third-party lab report or published lab dataset that can be checked from the product evidence.',
    inputs: ['Lab report status', 'Sources'],
  },
  {
    id: 'certification_body',
    label: 'Certified by a recognized body',
    max: 10,
    share: '10%',
    description:
      'Recognized certification bodies such as NSF or WQA add confidence that performance claims were independently reviewed.',
    inputs: ['Certifications'],
  },
  {
    id: 'filter_technology_disclosed',
    label: 'Filter technology disclosed',
    max: 5,
    share: '5%',
    description:
      'A small transparency credit for explaining the filtration media or system design instead of hiding the mechanism.',
    inputs: ['Technologies'],
  },
];

const removalCategories = [
  'PFAS',
  'Heavy metals',
  'Radiological elements',
  'Microbiologicals',
  'Fluoride',
  'VOCs',
  'Pesticides',
  'Pharmaceuticals',
  'Microplastics',
  'Nanoplastics',
  'Disinfectants',
  'THMs',
  'HAAs',
  'Herbicides',
  'Other published categories',
];

function RuleCard({
  rule,
}: {
  rule: {
    id: string;
    label: string;
    max: number;
    share: string;
    description: string;
    inputs: string[];
  };
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{rule.label}</h3>
          <p className="mt-1 font-mono text-xs text-gray-400 dark:text-gray-500">{rule.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{rule.max}</p>
          <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">max · {rule.share}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">{rule.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {rule.inputs.map((input) => (
          <span
            key={input}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-[var(--surface-muted)] dark:text-gray-300"
          >
            {input}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function WaterFilterScoringPage() {
  const labTested = waterFilterCards.filter((filter) => filter.hasLabTest).length;
  const certified = waterFilterCards.filter((filter) => filter.certificationCount > 0).length;
  const broadRemoval = waterFilterCards.filter((filter) => filter.categoryCount >= 10).length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header waters={waterCards} filters={waterFilterCards} ingredients={ingredientSearchCards} />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Scoring methodology · water filters
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              How filter scores work
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Water filters are scored against four evidence rules. The biggest one is
              measured contaminant removal, with smaller credits for indexed lab data,
              recognized certifications and disclosed filter technology.
            </p>
          </div>
          <Link
            href="/scoring"
            className="inline-flex self-start rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-200"
          >
            Water scoring
          </Link>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {waterFilterCards.length.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">filters scored</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {labTested.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">with lab data</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {certified.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">with certifications</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {broadRemoval.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">cover 10+ categories</p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Earned out of possible</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              The filter rubric is 4 rules worth 100 possible points. Each rule
              contributes up to its maximum, and the product page shows the exact
              breakdown behind the 0-100 score.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No proof, no credit</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              If a brand does not publish a measurement, certification or technology
              detail, that signal earns zero. The score rewards evidence, not vibes.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The rules</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">4 rules · 100 points possible</p>
            </div>
            <Link href="/filter" className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
              View filter rankings
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filterRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">What removal covers</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              The removal rule looks across the contaminant categories Oasis returned
              for each filter. Serious public-health categories like PFAS, heavy
              metals, radiologicals and microbiologicals carry the most weight.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {removalCategories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-[var(--surface-muted)] dark:text-gray-300"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How to read a filter page</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              <p>
                The score breakdown shows the four rule scores. The contaminant removal
                table below it shows which categories have measured percentages and
                which ones are incomplete or unknown.
              </p>
              <p>
                Certifications and technologies are confidence signals, but they do not
                replace actual removal data. A filter with strong disclosure should show
                both.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
