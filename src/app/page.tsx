import type { Metadata } from 'next';
import { waterCards } from '@/lib/data';
import Header from '@/components/Header';
import Leaderboard from '@/components/Leaderboard';

export const metadata: Metadata = {
  title: 'Water Brands Leaderboard',
  description:
    'Compare bottled, sparkling and gallon waters ranked by lab-tested purity, source quality, packaging and contaminants.',
  alternates: { canonical: '/' },
};

export default function Home() {
  const labTested = waterCards.filter((w) => w.hasLabTest).length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
            Water Brands Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every bottled, sparkling and gallon water ranked by lab-tested purity, source
            quality, packaging and contaminants.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <span><strong className="text-gray-900 dark:text-gray-100">{waterCards.length.toLocaleString()}</strong> waters ranked</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{labTested.toLocaleString()}</strong> lab tested</span>
            <span><strong className="text-gray-900 dark:text-gray-100">100</strong>-point purity score</span>
          </div>
        </div>

        <Leaderboard waters={waterCards} />
      </div>
    </main>
  );
}
