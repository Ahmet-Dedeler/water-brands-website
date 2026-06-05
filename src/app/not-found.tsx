import Link from 'next/link';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🚰</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">That water doesn&apos;t exist in our database.</p>
        <Link
          href="/"
          className="inline-flex px-5 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 transition-colors"
        >
          Back to leaderboard
        </Link>
      </div>
    </main>
  );
}
