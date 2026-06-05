import Link from 'next/link';
import Header from '@/components/Header';
import { btnSky } from '@/lib/ui-classes';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--surface-page)]">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4" aria-hidden="true">
          🚰
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">That water doesn&apos;t exist in our database.</p>
        <Link href="/" className={btnSky}>
          Back to leaderboard
        </Link>
      </div>
    </main>
  );
}
