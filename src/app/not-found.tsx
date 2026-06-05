import Link from 'next/link';
import Header from '@/components/Header';
import { waterCards } from '@/lib/data';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header waters={waterCards} />
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🚰</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">That water doesn&apos;t exist in our database.</p>
        <Link
          href="/"
          className="inline-flex px-5 py-2.5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Back to leaderboard
        </Link>
      </div>
    </main>
  );
}
