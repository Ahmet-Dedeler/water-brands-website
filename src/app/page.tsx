import Link from 'next/link';
import type { Metadata } from 'next';
import { waterCards } from '@/lib/data';
import Header from '@/components/Header';
import Leaderboard from '@/components/Leaderboard';
import { FaqSection, faqLd, itemListLd, JsonLd } from '@/components/seo';
import { getRanking, nameScore, popularFlagships, RANKINGS, rankingItems, type WaterRanking } from '@/lib/rankings';
import { CONTENT_YEAR } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  const labTested = waterCards.filter((w) => w.hasLabTest).length;
  const healthiest = rankingItems(getRanking('healthiest-bottled-water') as WaterRanking).items;
  const sparkling = rankingItems(getRanking('best-sparkling-water') as WaterRanking).items;
  const popular = popularFlagships().toSorted((a, b) => b.score - a.score);
  const quickLinks = RANKINGS.filter((r) => r.kind === 'water').slice(0, 8);

  const faqs = [
    {
      q: 'What is the healthiest bottled water brand?',
      a: `Based on third-party lab reports, ${nameScore(healthiest[0])} is the healthiest still bottled water right now, followed by ${nameScore(healthiest[1])} and ${nameScore(healthiest[2])}. The top waters share a natural spring or aquifer source, glass bottles, low contaminants and PFAS testing.`,
    },
    {
      q: 'What is the best bottled water brand you can find in most stores?',
      a: `Among widely available brands, ${nameScore(popular[0])} scores highest, followed by ${nameScore(popular[1])} and ${nameScore(popular[2])}. Big purified brands in plastic, like ${popular.at(-1)?.brandName ?? 'Aquafina'}, score lowest.`,
    },
    {
      q: 'What is the healthiest sparkling water?',
      a: `${nameScore(sparkling[0])} is the top-ranked sparkling water for purity, ahead of ${nameScore(sparkling[1])}.`,
    },
    {
      q: 'How are bottled waters ranked?',
      a: 'Each water gets a 0–100 purity score from its lab report, contaminants versus health guidelines, water source, mineral preservation, packaging, cap material and PFAS testing. Waters without a third-party lab report cannot score high.',
    },
    {
      q: 'Is bottled water healthier than tap water?',
      a: 'Not automatically. Tap water is tested more often, and a good filter can make it cleaner than most plastic-bottled water. A lab-tested water in glass is the best bottled option.',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <JsonLd
        data={[
          itemListLd(
            `Healthiest bottled water brands ${CONTENT_YEAR}`,
            healthiest.slice(0, 10).map((w) => ({ name: w.name, path: `/water/${w.id}` })),
          ),
          faqLd(faqs),
        ]}
      />
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="page-hero text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
            The best &amp; healthiest bottled water brands
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every bottled, sparkling and gallon water ranked by lab-tested contaminants, microplastics risk, PFAS testing,
            source and packaging. No paid placements.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <span><strong className="text-gray-900 dark:text-gray-100">{waterCards.length.toLocaleString()}</strong> waters ranked</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{labTested.toLocaleString()}</strong> lab tested</span>
            <span><strong className="text-gray-900 dark:text-gray-100">100</strong>-point purity score</span>
          </div>
          <p className="mt-6 max-w-2xl mx-auto text-base text-gray-700 dark:text-gray-300">
            <span aria-hidden="true">🏆 </span>
            <strong>Healthiest right now:</strong>{' '}
            {healthiest.slice(0, 3).map((w, i) => (
              <span key={w.id}>
                {i > 0 && ', '}
                <Link href={`/water/${w.id}`} className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white">
                  {w.name}
                </Link>{' '}
                ({w.score})
              </span>
            ))}
          </p>
          <nav aria-label="Popular rankings" className="mt-5 flex flex-wrap justify-center gap-2">
            {quickLinks.map((r) => (
              <Link
                key={r.slug}
                href={`/best/${r.slug}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-gray-300 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-200"
              >
                <span aria-hidden="true">{r.emoji} </span>
                {r.label}
              </Link>
            ))}
          </nav>
        </div>

        <Leaderboard waters={waterCards} />

        <div className="max-w-3xl mx-auto">
          <FaqSection faqs={faqs} />
        </div>
      </div>
    </main>
  );
}
