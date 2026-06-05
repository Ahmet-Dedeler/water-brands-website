'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import type { TapWaterCard } from '@/types';
import { motionPress } from '@/lib/ui-classes';

const PAGE_SIZE = 24;
const FEATURED_PLACES = [
  ['Glen Oaks', 'New York'],
  ['Chicago', 'Illinois'],
  ['Austin', 'Texas'],
  ['Burney', 'California'],
  ['Honolulu', 'Hawaii'],
  ['Santa Monica', 'California'],
  ['Venice', 'California'],
  ['Saratoga', 'California'],
  ['San Francisco', 'California'],
  ['Miami', 'Florida'],
  ['Dallas', 'Texas'],
  ['Flint', 'Michigan'],
  ['Denver', 'Colorado'],
  ['Detroit', 'Michigan'],
  ['Philadelphia', 'Pennsylvania'],
  ['Washington', 'District of Columbia'],
  ['Brooklyn', 'New York'],
  ['Irvine', 'California'],
  ['Beverly Hills', 'California'],
];

const scoreCopy = (score: number | null) => {
  if (score == null) return 'No score yet';
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Mixed';
  if (score >= 30) return 'Poor';
  return 'High concern';
};

const scoreTone = (score: number | null) => {
  if (score == null) return 'text-stone-400';
  if (score >= 70) return 'text-emerald-300';
  if (score >= 50) return 'text-amber-300';
  return 'text-red-300';
};

const placeLabel = (location: Pick<TapWaterCard, 'name' | 'state' | 'zipCode'>) =>
  [location.name, location.state, location.zipCode].filter(Boolean).join(', ');

function findFeatured(locations: TapWaterCard[]) {
  const used = new Set<number>();
  const picked: TapWaterCard[] = [];

  for (const [name, state] of FEATURED_PLACES) {
    const match = locations.find(
      (location) =>
        location.name?.toLowerCase() === name.toLowerCase() &&
        location.state?.toLowerCase() === state.toLowerCase(),
    );
    if (match && !used.has(match.id)) {
      picked.push(match);
      used.add(match.id);
    }
  }

  for (const location of locations) {
    if (picked.length >= 20) break;
    if (!used.has(location.id) && location.image && location.score != null && location.score < 75) {
      picked.push(location);
      used.add(location.id);
    }
  }

  return picked;
}

function CityImage({ location, large = false }: { location: TapWaterCard; large?: boolean }) {
  if (location.image) {
    return (
      <img
        src={location.image}
        alt={location.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.55),transparent_35%),linear-gradient(135deg,#355070,#16213e_55%,#0f172a)] ${
        large ? 'opacity-90' : 'opacity-80'
      }`}
      aria-hidden="true"
    />
  );
}

function FeaturedCard({ location }: { location: TapWaterCard }) {
  return (
    <Link
      href={`/tap-water/${location.id}`}
      className={`group tap-card flex h-[90px] w-[224px] shrink-0 items-center gap-3 rounded-md border border-stone-700 bg-[#241f1c] p-4 text-left hover:border-stone-500 hover:bg-[#2a2420] ${motionPress}`}
    >
      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-stone-800 ring-1 ring-white/10">
        <CityImage location={location} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-stone-100">{location.name}</span>
        <span className={`mt-0.5 block text-xs font-semibold ${scoreTone(location.score)}`}>
          {location.score ?? 'N/A'}/100
        </span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Water
        </span>
      </span>
    </Link>
  );
}

function ResultCard({ location }: { location: TapWaterCard }) {
  return (
    <Link
      href={`/tap-water/${location.id}`}
      className={`group tap-card grid overflow-hidden rounded-lg border border-stone-800 bg-[#1d1a18] hover:border-stone-600 hover:bg-[#231f1c] sm:grid-cols-[160px_1fr] ${motionPress}`}
    >
      <div className="relative h-36 bg-stone-900 sm:h-full">
        <CityImage location={location} large />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
      <div className="flex min-w-0 flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-stone-50">{location.name}</h2>
            <p className="mt-1 truncate text-sm text-stone-400">
              {[location.state, location.zipCode].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-semibold leading-none ${scoreTone(location.score)}`}>
              {location.score ?? '—'}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500">/100</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <span className="rounded-md bg-stone-900/70 px-3 py-2 text-stone-300">
            <strong className="block text-sm text-stone-50">{location.utilityCount}</strong>
            utilities
          </span>
          <span className="rounded-md bg-stone-900/70 px-3 py-2 text-stone-300">
            <strong className="block text-sm text-stone-50">{location.contaminantCount}</strong>
            detected
          </span>
          <span className="rounded-md bg-stone-900/70 px-3 py-2 text-stone-300">
            <strong className="block text-sm text-stone-50">{location.exceedingGuidelines}</strong>
            over guideline
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TapWaterLeaderboard({ locations }: { locations: TapWaterCard[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const featured = useMemo(() => findFeatured(locations), [locations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations.slice(0, 200);

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

  function openFirstResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (suggestions[0]) router.push(`/tap-water/${suggestions[0].id}`);
  }

  return (
    <div className="text-stone-100">
      <section className="mx-auto flex min-h-[430px] max-w-5xl flex-col items-center justify-center px-4 pb-12 pt-20 text-center sm:pt-24">
        <h1 className="text-5xl font-semibold tracking-normal text-stone-50 sm:text-6xl">
          Check your tap water
        </h1>
        <p className="mt-5 max-w-xl text-base text-stone-400">
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
              className="absolute left-7 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500"
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
              placeholder="Search a US city or zip code"
              autoComplete="off"
              className="h-16 w-full rounded-[1.6rem] border border-stone-800 bg-[#241f1c] pl-16 pr-7 text-base text-stone-100 outline-none transition-[border-color,background-color,box-shadow] duration-200 ease-[var(--ease-out)] placeholder:text-stone-500 focus:border-stone-600 focus:bg-[#2a2420] focus:ring-4 focus:ring-white/5"
            />
          </div>

          {query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-3 overflow-hidden rounded-xl border border-stone-800 bg-[#201c19] text-left shadow-2xl">
              {suggestions.length > 0 ? (
                <ul className="divide-y divide-stone-800">
                  {suggestions.map((location) => (
                    <li key={location.id}>
                      <Link
                        href={`/tap-water/${location.id}`}
                        className="search-result-item flex items-center gap-3 px-4 py-3 hover:bg-stone-800/70"
                      >
                        <span className="h-10 w-10 overflow-hidden rounded-full bg-stone-900">
                          <CityImage location={location} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-stone-100">
                            {placeLabel(location)}
                          </span>
                          <span className="block text-xs text-stone-500">{scoreCopy(location.score)}</span>
                        </span>
                        <span className={`text-sm font-semibold ${scoreTone(location.score)}`}>
                          {location.score ?? 'N/A'}/100
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-sm text-stone-400">No matching tap water locations.</p>
              )}
            </div>
          )}
        </form>
      </section>

      {featured.length > 0 && (
        <section aria-label="Popular tap water locations" className="overflow-hidden pb-12">
          <div className="overflow-hidden px-8 pb-4">
            <div className="marquee-track motion-reduce:flex motion-reduce:w-auto motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]">
              {[...featured, ...featured].map((location, index) => (
                <FeaturedCard key={`${location.id}-${index}`} location={location} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-stone-500">
              {query.trim() ? 'Search results' : 'Browse locations'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-50">
              {query.trim() ? `${filtered.length.toLocaleString()} matches` : 'Tap water ratings by city'}
            </h2>
          </div>
          <p className="text-sm text-stone-500">
            {locations.length.toLocaleString()} U.S. city and ZIP records
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((location) => (
            <ResultCard key={location.id} location={location} />
          ))}
        </div>

        {shown.length === 0 && (
          <div className="rounded-lg border border-stone-800 bg-[#1d1a18] px-6 py-12 text-center text-stone-400">
            No tap water locations match that search.
          </div>
        )}

        {visible < filtered.length && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisible((value) => value + PAGE_SIZE)}
              className={`rounded-full border border-stone-700 px-6 py-3 text-sm font-medium text-stone-100 transition-[transform,border-color,background-color] duration-200 ease-[var(--ease-out)] hover:border-stone-500 hover:bg-stone-900 active:scale-[0.98] motion-reduce:active:scale-100 ${motionPress}`}
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
