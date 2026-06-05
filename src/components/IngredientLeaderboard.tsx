'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { IngredientSearchCard } from '@/types';
import EmptyState from '@/components/motion/EmptyState';
import {
  btnPrimary,
  cardLinkRow,
  inputField,
  pillActive,
  pillButton,
  pillCountActive,
  pillCountInactive,
  pillInactive,
} from '@/lib/ui-classes';

const PAGE_SIZE = 80;

type Tab = 'all' | 'contaminants' | 'minerals';

function Card({ ingredient, rank }: { ingredient: IngredientSearchCard; rank: number }) {
  return (
    <Link href={`/ingredient/${ingredient.id}`} className={cardLinkRow}>
      <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-7 shrink-0 tabular-nums">#{rank}</span>
      <span className="text-xl shrink-0" aria-hidden="true">
        {ingredient.is_contaminant ? '⚠️' : '✨'}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{ingredient.name}</h2>
        {ingredient.category && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{ingredient.category}</p>
        )}
      </div>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
          ingredient.is_contaminant
            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
        }`}
      >
        {ingredient.is_contaminant ? 'Contaminant' : 'Mineral'}
      </span>
    </Link>
  );
}

export default function IngredientLeaderboard({ ingredients }: { ingredients: IngredientSearchCard[] }) {
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const contaminants = useMemo(() => ingredients.filter((i) => i.is_contaminant), [ingredients]);
  const minerals = useMemo(() => ingredients.filter((i) => !i.is_contaminant), [ingredients]);

  const baseList = tab === 'contaminants' ? contaminants : tab === 'minerals' ? minerals : ingredients;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(q) ||
        ingredient.category?.toLowerCase().includes(q)
    );
  }, [baseList, query]);

  const shown = filtered.slice(0, visible);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: ingredients.length },
    { key: 'contaminants', label: 'Contaminants', count: contaminants.length },
    { key: 'minerals', label: 'Minerals', count: minerals.length },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setVisible(PAGE_SIZE);
            }}
            className={`${pillButton} ${tab === item.key ? pillActive : pillInactive}`}
          >
            {item.label}
            <span className={tab === item.key ? pillCountActive : pillCountInactive}>{item.count}</span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label htmlFor="ingredient-search" className="sr-only">
          Search ingredients
        </label>
        <input
          id="ingredient-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search by name or category…"
          className={`w-full px-4 py-3 text-sm bg-white dark:bg-[var(--surface-raised)] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-200 dark:border-[var(--border-soft)] rounded-xl ${inputField}`}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🧪" title="No ingredients match your search." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shown.map((ingredient, index) => (
            <Card key={ingredient.id} ingredient={ingredient} rank={index + 1} />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="text-center mt-8">
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className={btnPrimary}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
