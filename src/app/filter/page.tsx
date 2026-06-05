import { ingredientSearchCards, waterCards, waterFilterCards } from '@/lib/data';
import Header from '@/components/Header';
import FilterLeaderboard from '@/components/FilterLeaderboard';

export default function FilterPage() {
  const labTested = waterFilterCards.filter((f) => f.hasLabTest).length;
  const certified = waterFilterCards.filter((f) => f.certificationCount > 0).length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header waters={waterCards} filters={waterFilterCards} ingredients={ingredientSearchCards} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
            Water Filter Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every pitcher, RO system, shower and faucet filter ranked by verified
            contaminant removal, certifications and lab data.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <span><strong className="text-gray-900 dark:text-gray-100">{waterFilterCards.length.toLocaleString()}</strong> filters ranked</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{labTested.toLocaleString()}</strong> lab tested</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{certified.toLocaleString()}</strong> certified</span>
          </div>
        </div>

        <FilterLeaderboard filters={waterFilterCards} />
      </div>
    </main>
  );
}
