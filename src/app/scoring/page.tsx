import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { waterCards, waterFilterCards } from '@/lib/data';

export const metadata: Metadata = {
  title: 'How Water Scores Work',
  description:
    'How Water Leaderboard explains bottled, sparkling, gallon, flavored and hydrogen water scores from lab reports, contaminants, source, packaging and PFAS evidence.',
  alternates: { canonical: '/scoring' },
};

const waterRules = [
  {
    id: 'lab_report',
    label: 'Lab report indexed',
    max: 45,
    share: '26%',
    description:
      'A third-party lab report is present and indexed. This is the trust anchor for the rest of the water quality evidence.',
    inputs: ['Lab report status', 'Sources'],
  },
  {
    id: 'contaminants',
    label: 'Contaminants',
    max: 50,
    share: '29%',
    description:
      'Flagged contaminants reduce the score based on what was detected, the amount reported and the relevant legal or health guideline.',
    inputs: ['Ingredient rows', 'Amounts', 'Guidelines'],
  },
  {
    id: 'water_source',
    label: 'Water source',
    max: 25,
    share: '15%',
    description:
      'Natural mineral-rich sources earn more credit. Unknown, municipal or lower-confidence sources earn less or no credit.',
    inputs: ['Source type'],
  },
  {
    id: 'heavy_ro_purification',
    label: 'Mineral preservation',
    max: 17,
    share: '10%',
    description:
      'Premium natural sources get dinged if heavy reverse osmosis appears to strip the minerals that made the source valuable.',
    inputs: ['Water source', 'Treatment process', 'Filtration methods'],
  },
  {
    id: 'packaging',
    label: 'Packaging material',
    max: 22,
    share: '13%',
    description:
      'Glass and low-leaching packaging score better. Plastic-heavy packaging loses points because of microplastic and leaching concerns.',
    inputs: ['Bottle material', 'No-plastic claims'],
  },
  {
    id: 'cap_material',
    label: 'Cap material',
    max: 7,
    share: '4%',
    description:
      'Caps are scored separately because the closure can touch the water and has its own leaching profile.',
    inputs: ['Cap material', 'No-plastic claims'],
  },
  {
    id: 'pfas_testing',
    label: 'PFAS testing',
    max: 5,
    share: '3%',
    description:
      'A small explicit credit for products that disclose PFAS testing instead of leaving forever-chemical status unknown.',
    inputs: ['PFAS tested flag'],
  },
];

const scoreRanges = [
  ['90-100', 'Exceptional evidence, clean contaminant profile and strong packaging/source signals.'],
  ['75-89', 'Generally strong, but with some tradeoff such as plastic packaging, missing PFAS testing or a few flagged minerals.'],
  ['50-74', 'Mixed evidence. Often missing testing, weaker packaging, source uncertainty or meaningful contaminant deductions.'],
  ['0-49', 'Low confidence or poor signals. Usually sparse disclosure, contaminant issues or many unknowns.'],
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

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{children}</div>
    </section>
  );
}

export default function ScoringPage() {
  const labReportCount = waterCards.filter((water) => water.hasLabReport).length;
  const noMicroplasticsCount = waterCards.filter((water) => water.noMicroplastics).length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header waters={waterCards} filters={waterFilterCards} />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Scoring methodology
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              How water scores work
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
              We surface Oasis-derived scoring evidence for bottled, sparkling, gallon,
              flavored and hydrogen waters. The headline score is normalized to 100,
              while each product page shows the exact rule contributions behind it.
            </p>
          </div>
          <Link
            href="/scoring/water-filters"
            className="inline-flex self-start rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-200"
          >
            Water filter scoring
          </Link>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {waterCards.length.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">water products scored</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {labReportCount.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">with indexed lab reports</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {noMicroplasticsCount.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">marked no microplastics</p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InfoPanel title="Earned out of possible">
            <p>
              The bottled-water rubric has 7 rules worth 171 possible points. The
              product earns points for evidence we can verify, then the final score is
              shown on a 0-100 scale.
            </p>
          </InfoPanel>
          <InfoPanel title="Unknowns earn zero">
            <p>
              Missing evidence is not filled in with a friendly guess. If a lab report,
              PFAS status, source or packaging detail is unknown, that part of the score
              gets little or no credit.
            </p>
          </InfoPanel>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The rules</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">7 rules · 171 points possible</p>
            </div>
            <Link href="/" className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
              View water rankings
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {waterRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Score ranges</h2>
            <dl className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
              {scoreRanges.map(([range, meaning]) => (
                <div key={range} className="grid grid-cols-[82px_1fr] gap-4 py-3">
                  <dt className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">{range}</dt>
                  <dd className="text-sm leading-6 text-gray-600 dark:text-gray-400">{meaning}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Why some products look different</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              <p>
                Some sparkling or flavored waters expose penalty-style fields such as
                <span className="font-mono text-xs text-gray-500"> untested_penalty </span>
                or
                <span className="font-mono text-xs text-gray-500"> packaging_penalty</span>.
                We keep those on the product page when Oasis returned them, because they
                explain the actual score we scraped.
              </p>
              <p>
                Nutrients and minerals are shown separately from contaminants. They help
                explain what is in the water, but the score still follows the breakdown
                returned for that product.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
