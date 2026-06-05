import type { Metadata } from 'next';
import Link from 'next/link';
import { tapWaterCards } from '@/lib/data';
import TapWaterLeaderboard from '@/components/TapWaterLeaderboard';
import { motionPress } from '@/lib/ui-classes';

export const metadata: Metadata = {
  title: 'Tap Water Rankings',
  description:
    'Municipal tap water quality by city and utility — contaminants, guideline exceedances and local water system scores across the United States.',
  alternates: { canonical: '/tap-water' },
};

export default function TapWaterPage() {
  return (
    <main className="min-h-screen bg-[#151413] text-stone-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className={`flex items-center gap-2 text-sm font-semibold text-indigo-400 ${motionPress}`}>
          <span className="text-lg" aria-hidden="true">🚰</span>
          <span>Water Leaderboard</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-stone-400 sm:gap-6" aria-label="Primary">
          <Link href="/" className="transition hover:text-stone-100">Rankings</Link>
          <Link href="/filter" className="transition hover:text-stone-100">Filters</Link>
          <Link href="/ingredients" className="hidden transition hover:text-stone-100 sm:inline">Ingredients</Link>
          <Link href="/scoring" className="hidden transition hover:text-stone-100 sm:inline">Scoring</Link>
        </nav>
      </header>

      <TapWaterLeaderboard locations={tapWaterCards} />
    </main>
  );
}
