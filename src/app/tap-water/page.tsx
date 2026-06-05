import { ingredientSearchCards, tapWaterCards, waterCards, waterFilterCards } from '@/lib/data';
import Header from '@/components/Header';
import TapWaterLeaderboard from '@/components/TapWaterLeaderboard';

export default function TapWaterPage() {
  const withScore = tapWaterCards.filter((location) => location.score != null).length;
  const withExceeding = tapWaterCards.filter((location) => location.exceedingGuidelines > 0).length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header waters={waterCards} filters={waterFilterCards} ingredients={ingredientSearchCards} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
            Tap Water Rankings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Municipal tap water quality by city and utility — contaminants, guideline exceedances
            and local water system scores.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <span><strong className="text-gray-900 dark:text-gray-100">{tapWaterCards.length.toLocaleString()}</strong> locations</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{withScore.toLocaleString()}</strong> scored</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{withExceeding.toLocaleString()}</strong> with guideline exceedances</span>
          </div>
        </div>

        <TapWaterLeaderboard locations={tapWaterCards} />
      </div>
    </main>
  );
}
