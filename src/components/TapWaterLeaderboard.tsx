'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { TapWaterCard } from '@/types';
import { CityImage, scoreTone } from '@/components/TapWaterFeatured';
import { btnSecondary, inputField, motionPress } from '@/lib/ui-classes';

const PAGE_SIZE = 24;
const SEARCH_MIN_LENGTH = 2;

const scoreCopy = (score: number | null) => {
  if (score == null) return 'No score yet';
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Mixed';
  if (score >= 30) return 'Poor';
  return 'High concern';
};

const placeLabel = (location: Pick<TapWaterCard, 'name' | 'state' | 'zipCode'>) =>
  [location.name, location.state, location.zipCode].filter(Boolean).join(', ');

function ResultCard({ location }: { location: TapWaterCard }) {
  return (
    <Link
      href={`/tap-water/${location.id}`}
      className={`group grid overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:hover:border-gray-500 sm:grid-cols-[180px_1fr] ${motionPress}`}
    >
      <div className="relative h-40 bg-gray-100 dark:bg-[var(--surface-muted)] sm:h-full sm:min-h-[160px]">
        <CityImage location={location} large />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/35" />
      </div>
      <div className="flex min-w-0 flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{location.name}</h2>
            <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
              {[location.state, location.zipCode].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-semibold leading-none ${scoreTone(location.score)}`}>
              {location.score ?? '—'}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">/100</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <span className="rounded-md bg-gray-50 px-3 py-2 text-gray-600 dark:bg-[var(--surface-muted)] dark:text-gray-300">
            <strong className="block text-sm text-gray-900 dark:text-gray-100">{location.utilityCount}</strong>
            utilities
          </span>
          <span className="rounded-md bg-gray-50 px-3 py-2 text-gray-600 dark:bg-[var(--surface-muted)] dark:text-gray-300">
            <strong className="block text-sm text-gray-900 dark:text-gray-100">{location.contaminantCount}</strong>
            detected
          </span>
          <span className="rounded-md bg-gray-50 px-3 py-2 text-gray-600 dark:bg-[var(--surface-muted)] dark:text-gray-300">
            <strong className="block text-sm text-gray-900 dark:text-gray-100">{location.exceedingGuidelines}</strong>
            over guideline
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TapWaterLeaderboard({
  locations,
  children,
}: {
  locations: TapWaterCard[];
  children?: ReactNode;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < SEARCH_MIN_LENGTH) return [];

    return locations
      .filter((location) =>
        [location.name, location.state, location.country, location.zipCode]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 200);
  }, [locations, query]);

  const suggestions = useMemo(() => filtered.slice(0, 7), [filtered]);
  const shown = filtered.slice(0, visible);

  function goToFirstMatch(rawQuery: string) {
    const q = rawQuery.trim().toLowerCase();
    if (q.length < SEARCH_MIN_LENGTH) return;

    const first = locations.find((location) =>
      [location.name, location.state, location.country, location.zipCode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );

    if (first) router.push(`/tap-water/${first.id}`);
  }

  function openFirstResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.querySelector('input') as HTMLInputElement | null;
    goToFirstMatch(input?.value ?? query);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    goToFirstMatch(event.currentTarget.value);
  }

  return (
    <div>
      <section className="page-hero flex min-h-[360px] flex-col items-center justify-center pb-12 pt-4 text-center sm:min-h-[400px]">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          Check your tap water
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          Uncover the hidden toxins in your tap. Search any U.S. city or zip code.
        </p>

        <form onSubmit={openFirstResult} className="relative mt-10 w-full max-w-[640px]">
          <label htmlFor="tap-water-search" className="sr-only">
            Search a US city or zip code
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
            <input
              id="tap-water-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search a US city or zip code"
              autoComplete="off"
              className={`h-14 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-5 text-base text-gray-900 placeholder:text-gray-500 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-100 dark:placeholder:text-gray-400 ${inputField}`}
            />
          </div>

          {query.trim().length >= SEARCH_MIN_LENGTH && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-lg animate-dropdown dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)]">
              {suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {suggestions.map((location) => (
                    <li key={location.id}>
                      <Link
                        href={`/tap-water/${location.id}`}
                        className="search-result-item flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-[var(--surface-muted)]">
                          <CityImage location={location} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                            {placeLabel(location)}
                          </span>
                          <span className="block text-xs text-gray-400">{scoreCopy(location.score)}</span>
                        </span>
                        <span className={`text-sm font-semibold ${scoreTone(location.score)}`}>
                          {location.score ?? 'N/A'}/100
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">No matching tap water locations.</p>
              )}
            </div>
          )}
        </form>
      </section>

      {children}

      {query.trim().length >= SEARCH_MIN_LENGTH && (
        <section className="pb-4">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Search results</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {filtered.length.toLocaleString()} matches
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locations.length.toLocaleString()} U.S. city and ZIP records
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((location) => (
              <ResultCard key={location.id} location={location} />
            ))}
          </div>

          {shown.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500 dark:border-[var(--border-soft)] dark:bg-[var(--surface-raised)] dark:text-gray-400">
              No tap water locations match that search.
            </div>
          )}

          {visible < filtered.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisible((value) => value + PAGE_SIZE)}
                className={btnSecondary}
              >
                Load more
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
