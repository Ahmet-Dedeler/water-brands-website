'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { WaterCard, WaterRankingFilters, WaterType } from '@/types';
import { scoreTier, SCORE_COLORS, waterTypeLabel, titleize } from '@/lib/format';
import {
  countActiveFilters,
  EMPTY_FILTERS,
  matchesRankingFilters,
} from '@/lib/water-filters';
import WaterFilters from '@/components/WaterFilters';

const PAGE_SIZE = 60;

type TypeFilter = 'all' | WaterType;

const TYPE_FILTERS: { key: TypeFilter; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '🌊' },
  { key: 'bottled_water', label: 'Still', emoji: '💧' },
  { key: 'sparkling_water', label: 'Sparkling', emoji: '🫧' },
  { key: 'water_gallon', label: 'Gallon', emoji: '🪣' },
  { key: 'flavored_water', label: 'Flavored', emoji: '🍋' },
];

function ScoreBadge({ score }: { score: number }) {
  const colors = SCORE_COLORS[scoreTier(score)];
  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} ${colors.text} font-bold ring-1 ${colors.ring}`}>
      {score}
    </span>
  );
}

function Card({ water, rank }: { water: WaterCard; rank: number }) {
  return (
    <Link
      href={`/water/${water.id}`}
      className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden"
    >
      <div className="flex items-start gap-4 p-5">
        <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-7 shrink-0 pt-1 tabular-nums">#{rank}</span>
        <div className="relative w-16 h-16 shrink-0">
          {water.image ? (
            <Image src={water.image} alt="" fill sizes="64px" className="object-contain" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200 dark:text-gray-700" aria-hidden="true">💧</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">{water.name}</h2>
          {water.brandName && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{water.brandName}</p>}
        </div>
        <ScoreBadge score={water.score} />
      </div>
      <div className="mt-auto flex flex-wrap gap-2 px-5 pb-4 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">{waterTypeLabel(water.type)}</span>
        {water.packaging && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{titleize(water.packaging)}</span>
        )}
        {water.waterSource && water.waterSource !== 'unknown' && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{titleize(water.waterSource)}</span>
        )}
      </div>
    </Link>
  );
}

export default function Leaderboard({ waters }: { waters: WaterCard[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [rankingFilters, setRankingFilters] = useState<WaterRankingFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const activeFilterCount = countActiveFilters(rankingFilters);

  const filtered = useMemo(() => {
    return waters.filter((water) => {
      if (typeFilter !== 'all' && water.type !== typeFilter) return false;
      return matchesRankingFilters(water, rankingFilters);
    });
  }, [typeFilter, rankingFilters, waters]);

  const typeCounts = useMemo(() => {
    const rankingFiltered = waters.filter((w) => matchesRankingFilters(w, rankingFilters));
    const counts: Record<string, number> = { all: rankingFiltered.length };
    for (const w of rankingFiltered) counts[w.type] = (counts[w.type] || 0) + 1;
    return counts;
  }, [rankingFilters, waters]);

  const resetPagination = () => setVisible(PAGE_SIZE);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setTypeFilter(f.key);
                  resetPagination();
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span aria-hidden="true">{f.emoji}</span>
                {f.label}
                <span className={`${active ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400'}`}>
                  {typeCounts[f.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Filters
            <span
              className={`ml-2 ${
                filtersOpen || activeFilterCount > 0 ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400'
              }`}
            >
              {filtered.length.toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mb-6">
          <WaterFilters
            value={rankingFilters}
            onChange={(next) => {
              setRankingFilters(next);
              resetPagination();
            }}
            onReset={() => {
              setRankingFilters(EMPTY_FILTERS);
              resetPagination();
            }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-12 text-center">
          <p className="text-gray-700 dark:text-gray-300 font-medium">No waters match these filters.</p>
          <button
            type="button"
            onClick={() => {
              setRankingFilters(EMPTY_FILTERS);
              setTypeFilter('all');
              resetPagination();
            }}
            className="mt-3 text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((water, i) => (
            <Card key={water.id} water={water} rank={i + 1} />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
          >
            Show more ({filtered.length - visible} left)
          </button>
        </div>
      )}
    </div>
  );
}
