'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { TapWaterCard } from '@/types';
import { scoreTier, SCORE_COLORS } from '@/lib/format';
import { pillActive, pillCountActive, pillCountInactive, pillInactive } from '@/lib/ui-classes';

const PAGE_SIZE = 60;

function ScoreBadge({ score }: { score: number }) {
  const colors = SCORE_COLORS[scoreTier(score)];
  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} ${colors.text} font-bold ring-1 ${colors.ring}`}>
      {score}
    </span>
  );
}

function Card({ location, rank }: { location: TapWaterCard; rank: number }) {
  const locationLabel = [location.name, location.state, location.zipCode].filter(Boolean).join(', ');

  return (
    <Link
      href={`/tap-water/${location.id}`}
      className="group relative flex flex-col bg-white dark:bg-[var(--surface-raised)] rounded-xl border border-gray-100 dark:border-[var(--border-soft)] shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-500 transition-all duration-200 overflow-hidden"
    >
      <div className="flex items-start gap-4 p-5">
        <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-7 shrink-0 pt-1 tabular-nums">#{rank}</span>
        <div className="w-16 h-16 shrink-0 flex items-center justify-center text-2xl text-gray-200 dark:text-gray-700" aria-hidden="true">
          🚰
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">{locationLabel}</h2>
          {location.country && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{location.country}</p>}
        </div>
        {location.score != null && <ScoreBadge score={location.score} />}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 px-5 pb-4 text-xs">
        {location.utilityCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">
            {location.utilityCount} {location.utilityCount === 1 ? 'utility' : 'utilities'}
          </span>
        )}
        {location.contaminantCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
            {location.contaminantCount} contaminants
          </span>
        )}
        {location.exceedingGuidelines > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
            {location.exceedingGuidelines} over guideline
          </span>
        )}
      </div>
    </Link>
  );
}

export default function TapWaterLeaderboard({ locations }: { locations: TapWaterCard[] }) {
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const states = useMemo(() => {
    const counts = new Map<string, number>();
    for (const location of locations) {
      if (!location.state) continue;
      counts.set(location.state, (counts.get(location.state) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12);
  }, [locations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations.filter((location) => {
      if (stateFilter !== 'all' && location.state !== stateFilter) return false;
      if (!q) return true;
      const haystack = [
        location.name,
        location.state,
        location.country,
        location.zipCode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [locations, query, stateFilter]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="tap-water-search" className="sr-only">
          Search tap water by city, state or ZIP
        </label>
        <input
          id="tap-water-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search by city, state or ZIP code…"
          className="w-full px-4 py-3 text-sm bg-white dark:bg-[var(--surface-raised)] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-200 dark:border-[var(--border-soft)] rounded-xl focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500 focus:outline-none"
        />
      </div>

      {states.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setStateFilter('all');
              setVisible(PAGE_SIZE);
            }}
            className={stateFilter === 'all' ? pillActive : pillInactive}
          >
            All states
            <span className={stateFilter === 'all' ? pillCountActive : pillCountInactive}>
              {locations.length.toLocaleString()}
            </span>
          </button>
          {states.map(([state, count]) => (
            <button
              key={state}
              type="button"
              onClick={() => {
                setStateFilter(state);
                setVisible(PAGE_SIZE);
              }}
              className={stateFilter === state ? pillActive : pillInactive}
            >
              {state}
              <span className={stateFilter === state ? pillCountActive : pillCountInactive}>{count}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing <strong className="text-gray-900 dark:text-gray-100">{shown.length.toLocaleString()}</strong> of{' '}
        <strong className="text-gray-900 dark:text-gray-100">{filtered.length.toLocaleString()}</strong> locations
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shown.map((location, index) => (
          <Card key={location.id} location={location} rank={index + 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">No tap water locations match your search.</p>
      )}

      {visible < filtered.length && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
