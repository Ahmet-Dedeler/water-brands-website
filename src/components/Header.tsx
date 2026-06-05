'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { IngredientSearchCard, WaterCard, WaterFilterCard } from '@/types';
import { waterTypeLabel, filterTypeLabel } from '@/lib/format';
import { pillActive, pillInactive } from '@/lib/ui-classes';

type Section = 'drinks' | 'filter' | 'scoring' | 'ingredient';

export default function Header({
  waters,
  filters,
  ingredients = [],
}: {
  waters: WaterCard[];
  filters: WaterFilterCard[];
  ingredients?: IngredientSearchCard[];
}) {
  const pathname = usePathname();
  const section: Section = pathname.startsWith('/filter')
    ? 'filter'
    : pathname.startsWith('/ingredient')
      ? 'ingredient'
      : pathname.startsWith('/scoring')
        ? 'scoring'
        : 'drinks';

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const waterResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return waters
      .filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.brandName?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, waters]);

  const filterResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return filters
      .filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.brandName?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, filters]);

  const ingredientResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return ingredients
      .filter(
        (ingredient) =>
          ingredient.name?.toLowerCase().includes(q) ||
          ingredient.category?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, ingredients]);

  const results =
    section === 'filter'
      ? filterResults
      : section === 'ingredient'
        ? ingredientResults
        : waterResults;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active ? pillActive : `${pillInactive} border-transparent dark:border-transparent`
    }`;

  return (
    <header className="sticky top-0 z-20 bg-white/85 dark:bg-[var(--surface-page)]/90 backdrop-blur border-b border-gray-100 dark:border-[var(--border-soft)] mb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center gap-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap shrink-0">
            <span className="text-xl">🚰</span>
            <span className="hidden sm:inline">Water Leaderboard</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
            <nav className="flex items-center gap-1 shrink-0" aria-label="Product categories">
              <Link href="/" className={navLinkClass(section === 'drinks')}>
                <span aria-hidden="true">💧</span>
                Drinks
              </Link>
              <Link href="/filter" className={navLinkClass(section === 'filter')}>
                <span aria-hidden="true">🫖</span>
                Filter
              </Link>
              <Link href="/scoring" className={navLinkClass(section === 'scoring')}>
                <span aria-hidden="true">📊</span>
                Scoring
              </Link>
            </nav>

            <div ref={searchRef} className="relative w-full max-w-md min-w-0" role="search">
            <label htmlFor="product-search" className="sr-only">
              {section === 'filter'
                ? 'Search filters and brands'
                : section === 'ingredient'
                  ? 'Search ingredients'
                  : 'Search waters and brands'}
            </label>
            <input
              id="product-search"
              type="search"
              placeholder={
                section === 'filter'
                  ? `Search ${filters.length.toLocaleString()}+ filters or brands…`
                  : section === 'ingredient'
                    ? `Search ${ingredients.length.toLocaleString()}+ ingredients…`
                    : `Search ${waters.length.toLocaleString()}+ waters or brands…`
              }
              aria-label={
                section === 'filter'
                  ? 'Search filters and brands'
                  : section === 'ingredient'
                    ? 'Search ingredients'
                    : 'Search waters and brands'
              }
              aria-controls={results.length > 0 ? 'search-results' : undefined}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-[var(--surface-muted)] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-transparent rounded-lg focus:bg-white dark:focus:bg-[var(--surface-raised)] focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {isFocused && results.length > 0 && (
              <div
                id="search-results"
                role="listbox"
                aria-label="Search results"
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] rounded-lg shadow-lg z-10 overflow-hidden"
              >
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {section === 'ingredient'
                    ? ingredientResults.map((ingredient) => (
                        <li key={ingredient.id} role="option" aria-selected="false">
                          <Link
                            href={`/ingredient/${ingredient.id}`}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setIsFocused(false)}
                          >
                            <span className="w-8 h-8 mr-3 flex items-center justify-center text-gray-300" aria-hidden="true">
                              {ingredient.is_contaminant ? '⚠️' : '✨'}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {ingredient.name}
                              </span>
                              {ingredient.category && (
                                <span className="block text-xs text-gray-400 truncate">{ingredient.category}</span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))
                    : section === 'filter'
                    ? filterResults.map((filter) => (
                        <li key={filter.id} role="option" aria-selected="false">
                          <Link
                            href={`/filter/${filter.id}`}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setIsFocused(false)}
                          >
                            {filter.image ? (
                              <Image src={filter.image} alt="" width={32} height={32} className="w-8 h-8 object-contain mr-3" />
                            ) : (
                              <span className="w-8 h-8 mr-3 flex items-center justify-center text-gray-300" aria-hidden="true">🫖</span>
                            )}
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{filter.name}</span>
                              {filter.brandName && <span className="block text-xs text-gray-400 truncate">{filter.brandName}</span>}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">{filterTypeLabel(filter.type)}</span>
                          </Link>
                        </li>
                      ))
                    : waterResults.map((water) => (
                        <li key={water.id} role="option" aria-selected="false">
                          <Link
                            href={`/water/${water.id}`}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setIsFocused(false)}
                          >
                            {water.image ? (
                              <Image src={water.image} alt="" width={32} height={32} className="w-8 h-8 object-contain mr-3" />
                            ) : (
                              <span className="w-8 h-8 mr-3 flex items-center justify-center text-gray-300" aria-hidden="true">💧</span>
                            )}
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{water.name}</span>
                              {water.brandName && <span className="block text-xs text-gray-400 truncate">{water.brandName}</span>}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">{waterTypeLabel(water.type)}</span>
                          </Link>
                        </li>
                      ))}
                </ul>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
