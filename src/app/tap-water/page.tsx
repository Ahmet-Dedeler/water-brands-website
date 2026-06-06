import type { Metadata } from 'next';
import { tapWaterCards } from '@/lib/data';
import { getFeaturedTapWaterCards } from '@/lib/tap-water-featured';
import Header from '@/components/Header';
import TapWaterFeatured from '@/components/TapWaterFeatured';
import TapWaterLeaderboard from '@/components/TapWaterLeaderboard';

export const metadata: Metadata = {
  title: 'Tap Water Rankings',
  description:
    'Municipal tap water quality by city and utility — contaminants, guideline exceedances and local water system scores across the United States.',
  alternates: { canonical: '/tap-water' },
};

export default function TapWaterPage() {
  const featured = getFeaturedTapWaterCards(tapWaterCards);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <TapWaterLeaderboard locations={tapWaterCards}>
          <TapWaterFeatured featured={featured} />
        </TapWaterLeaderboard>
      </div>
    </main>
  );
}
