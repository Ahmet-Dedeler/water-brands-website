import Link from 'next/link';
import { RANKINGS } from '@/lib/rankings';
import { GUIDES } from '@/lib/guides';
import { DATA_SOURCE, SITE_NAME } from '@/lib/site';

/** Site-wide footer: internal links help crawlers reach every ranking and guide. */
export default function Footer() {
  const waterLists = RANKINGS.filter((r) => r.kind === 'water');
  const filterLists = RANKINGS.filter((r) => r.kind === 'filter');
  const col = 'space-y-2 text-sm';
  const link = 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100';
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="mb-3 font-semibold text-gray-900 dark:text-gray-100"><span aria-hidden="true">💧 </span>Bottled water</p>
          <ul className={col}>
            {waterLists.map((r) => (
              <li key={r.slug}><Link href={`/best/${r.slug}`} className={link}>{r.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gray-900 dark:text-gray-100"><span aria-hidden="true">🫖 </span>Water filters</p>
          <ul className={col}>
            {filterLists.map((r) => (
              <li key={r.slug}><Link href={`/best/${r.slug}`} className={link}>{r.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gray-900 dark:text-gray-100"><span aria-hidden="true">📚 </span>Guides</p>
          <ul className={col}>
            {GUIDES.map((g) => (
              <li key={g.slug}><Link href={`/guides/${g.slug}`} className={link}>{g.h1.replace(/\?$/, '')}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-gray-900 dark:text-gray-100"><span aria-hidden="true">🚰 </span>{SITE_NAME}</p>
          <ul className={col}>
            <li><Link href="/" className={link}>Water leaderboard</Link></li>
            <li><Link href="/filter" className={link}>Filter leaderboard</Link></li>
            <li><Link href="/tap-water" className={link}>Tap water by city</Link></li>
            <li><Link href="/ingredients" className={link}>Contaminants & minerals</Link></li>
            <li><Link href="/scoring" className={link}>How we score</Link></li>
            <li><Link href="/about" className={link}>About & methodology</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-gray-500 dark:text-gray-400">
        Independent rankings built from third-party lab reports. Product data via{' '}
        <a href={DATA_SOURCE.url} className="underline" target="_blank" rel="noopener noreferrer">{DATA_SOURCE.name}</a>. Not medical advice.
      </p>
    </footer>
  );
}
