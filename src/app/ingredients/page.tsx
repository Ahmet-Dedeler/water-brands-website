import { ingredientSearchCards, waterCards, waterFilterCards } from '@/lib/data';
import Header from '@/components/Header';
import IngredientLeaderboard from '@/components/IngredientLeaderboard';

export default function IngredientsPage() {
  const contaminants = ingredientSearchCards.filter((i) => i.is_contaminant).length;
  const minerals = ingredientSearchCards.length - contaminants;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header waters={waterCards} filters={waterFilterCards} ingredients={ingredientSearchCards} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
            Water Ingredients
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Contaminants and minerals found in ranked waters and tap water systems — health
            guidelines, risks and which products contain each compound.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <span><strong className="text-gray-900 dark:text-gray-100">{ingredientSearchCards.length.toLocaleString()}</strong> compounds</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{contaminants.toLocaleString()}</strong> contaminants</span>
            <span><strong className="text-gray-900 dark:text-gray-100">{minerals.toLocaleString()}</strong> minerals</span>
          </div>
        </div>

        <IngredientLeaderboard ingredients={ingredientSearchCards} />
      </div>
    </main>
  );
}
