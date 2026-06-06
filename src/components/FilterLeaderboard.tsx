'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { WaterFilterCard, WaterFilterType } from '@/types';
import { scoreTier, SCORE_COLORS, filterTypeLabel } from '@/lib/format';
import EmptyState from '@/components/motion/EmptyState';
import {
  btnSecondary,
  cardLink,
  pillActive,
  pillButton,
  pillCountActive,
  pillCountInactive,
  pillInactive,
} from '@/lib/ui-classes';

const PAGE_SIZE = 60;

type TypeFilter = 'all' | WaterFilterType;

const TYPE_FILTERS: { key: TypeFilter; label: string; emoji: string }[] = [
  { key: 'all', label: 'All water filters', emoji: '🌊' },
  { key: 'shower_filter', label: 'Shower filters', emoji: '🚿' },
  { key: 'sink_filter', label: 'Sink filters', emoji: '🚰' },
  { key: 'bottle_filter', label: 'Water bottle filters', emoji: '🍶' },
  { key: 'home_filter', label: 'Home filters', emoji: '🏠' },
];

function ScoreBadge({ score }: { score: number }) {
  const colors = SCORE_COLORS[scoreTier(score)];
  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} ${colors.text} font-bold ring-1 ${colors.ring}`}>
      {score}
    </span>
  );
}

function Card({ filter, rank }: { filter: WaterFilterCard; rank: number }) {
  return (
    <Link href={`/filter/${filter.id}`} className={cardLink}>
      <div className="flex items-start gap-4 p-5">
        <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-7 shrink-0 pt-1 tabular-nums">#{rank}</span>
        <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-lg">
          {filter.image ? (
            <Image src={filter.image} alt="" fill sizes="112px" className="object-contain" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200 dark:text-gray-700" aria-hidden="true">🫖</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">{filter.name}</h2>
          {filter.brandName && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{filter.brandName}</p>}
        </div>
        <ScoreBadge score={filter.score} />
      </div>
      <div className="mt-auto flex flex-wrap gap-2 px-5 pb-4 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">{filterTypeLabel(filter.type)}</span>
        {filter.technologies.map((tech) => (
          <span key={tech} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[var(--surface-muted)] text-gray-600 dark:text-gray-300">{tech}</span>
        ))}
        {filter.categoryCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
            {filter.categoryCount} categories
          </span>
        )}
      </div>
    </Link>
  );
}

export default function FilterLeaderboard({ filters }: { filters: WaterFilterCard[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return filters;
    return filters.filter((f) => f.type === typeFilter);
  }, [typeFilter, filters]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filters.length };
    for (const f of filters) counts[f.type] = (counts[f.type] || 0) + 1;
    return counts;
  }, [filters]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_FILTERS.map((f) => {
          const active = typeFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setTypeFilter(f.key);
                setVisible(PAGE_SIZE);
              }}
              className={`${pillButton} ${active ? pillActive : pillInactive}`}
            >
              <span aria-hidden="true">{f.emoji}</span>
              {f.label}
              <span className={active ? pillCountActive : pillCountInactive}>
                {typeCounts[f.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🫖" title="No water filters match this category.">
          <button
            type="button"
            onClick={() => {
              setTypeFilter('all');
              setVisible(PAGE_SIZE);
            }}
            className="mt-3 text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
          >
            Show all water filters
          </button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((filter, i) => (
            <Card key={filter.id} filter={filter} rank={i + 1} />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="text-center mt-8">
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className={btnSecondary}>
            Show more ({filtered.length - visible} left)
          </button>
        </div>
      )}
    </div>
  );
}
